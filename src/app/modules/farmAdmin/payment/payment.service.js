import Stripe from "stripe";
import { envVars } from "../../../config/env.js";
import prisma from "../../../prisma/client.js";
import DevBuildError from "../../../lib/DevBuildError.js";
import { StatusCodes } from "http-status-codes";

const stripe = new Stripe(envVars.STRIPE_SECRET_KEY);

const createCheckoutSession = async (user, payload) => {
  const { planId, priceType } = payload; // priceType: 'monthly' or 'yearly'

  if (!planId) {
    throw new DevBuildError("planId is required in the request body", StatusCodes.BAD_REQUEST);
  }

  if (!priceType || !["monthly", "yearly"].includes(priceType)) {
    throw new DevBuildError(
      "priceType is required and must be either 'monthly' or 'yearly'",
      StatusCodes.BAD_REQUEST
    );
  }

  if (!user.farmId) {
    throw new DevBuildError("User is not associated with any farm", StatusCodes.BAD_REQUEST);
  }

  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new DevBuildError("Plan not found", StatusCodes.NOT_FOUND);
  }

  let priceId = priceType === "yearly" ? plan.stripeYearlyPriceId : plan.stripeMonthlyPriceId;

  if (!priceId) {
    throw new DevBuildError(
      `Stripe price ID for ${priceType} plan is not configured`,
      StatusCodes.BAD_REQUEST
    );
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    subscription_data: {
      ...(plan.trialDays > 0 && { trial_period_days: plan.trialDays }),
      metadata: {
        farmId: user.farmId,
        planId: plan.id,
        priceType,
      },
    },
    success_url: `${envVars.FRONT_END_URL}/dashboard?payment=success`,
    cancel_url: `${envVars.FRONT_END_URL}/dashboard?payment=cancel`,
    customer_email: user.email,
    metadata: {
      farmId: user.farmId,
      planId: plan.id,
      priceType,
    },
  });

  return session.url;
};

const handleWebhook = async (signature, rawBody) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      envVars.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    throw new DevBuildError("Webhook Error", StatusCodes.BAD_REQUEST);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { farmId, planId, priceType } = session.metadata;

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      console.error(`Plan not found for ID: ${planId}`);
      return;
    }

    const price = priceType === "yearly" ? plan.priceYearly : plan.priceMonthly;
    const durationDays = priceType === "yearly" ? 365 : 30;

    const startDate = new Date();
    const endDate = new Date();
    const trialDays = plan.trialDays ?? 7;
    // Add trial + the plan duration
    endDate.setDate(startDate.getDate() + trialDays + durationDays);

    // Update or create subscription
    await prisma.$transaction([
      prisma.subscription.upsert({
        where: { farmId: farmId },
        update: {
          planId: planId,
          status: plan.trialDays > 0 ? "TRIAL" : "ACTIVE",
          startDate,
          endDate,
          price,
          priceType,
          stripeSubscriptionId: session.subscription,
          stripeCustomerId: session.customer,
        },
        create: {
          farmId,
          planId,
          status: plan.trialDays > 0 ? "TRIAL" : "ACTIVE",
          startDate,
          endDate,
          price,
          priceType,
          stripeSubscriptionId: session.subscription,
          stripeCustomerId: session.customer,
        },
      }),
      prisma.farm.update({
        where: { id: farmId },
        data: { 
          status: "ACTIVE",
          stripeCustomerId: session.customer,
        },
      }),
    ]);
  } else if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object;
    console.log(`🔔 invoice.payment_succeeded received: ${invoice.id}`);
    
    // Robust metadata extraction helper
    const getMetadata = (invoice, field) => {
      return (
        invoice.subscription_details?.metadata?.[field] ||
        invoice.metadata?.[field] ||
        invoice.lines?.data?.[0]?.metadata?.[field]
      );
    };

    let farmId = getMetadata(invoice, "farmId");
    let planId = getMetadata(invoice, "planId");
    let priceType = getMetadata(invoice, "priceType");

    // Fallback 1: Fetch from Stripe Subscription API
    if (!farmId && invoice.subscription) {
      console.log(`🔍 Metadata missing on invoice, fetching from Stripe subscription: ${invoice.subscription}`);
      try {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        farmId = farmId || subscription.metadata?.farmId;
        planId = planId || subscription.metadata?.planId;
        priceType = priceType || subscription.metadata?.priceType;
      } catch (err) {
        console.error(`❌ Failed to retrieve sub from Stripe: ${err.message}`);
      }
    }

    // Fallback 2: Search our DB by Stripe Subscription ID
    if (!farmId && invoice.subscription) {
      console.log(`🔍 Metadata missing, searching DB by stripeSubscriptionId: ${invoice.subscription}`);
      const sub = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: invoice.subscription }
      });
      if (sub) {
        farmId = sub.farmId;
        planId = planId || sub.planId;
        priceType = priceType || sub.priceType;
      }
    }

    // Fallback 3: Search our DB by Stripe Customer ID
    if (!farmId && invoice.customer) {
      console.log(`🔍 Metadata missing, searching DB by stripeCustomerId: ${invoice.customer}`);
      const farm = await prisma.farm.findUnique({
        where: { stripeCustomerId: invoice.customer }
      });
      if (farm) farmId = farm.id;
    }

    console.log(`📍 Webhook Result - Farm: ${farmId}, Plan: ${planId}, Amount: ${invoice.amount_paid}`);

    if (farmId && invoice.amount_paid > 0) {
      // Fetch plan name if planId is available
      let planName = null;
      if (planId) {
        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        planName = plan?.name;
      }

      // Calculate period end (usually from the line items)
      const periodEnd = invoice.lines?.data?.[0]?.period?.end 
        ? new Date(invoice.lines.data[0].period.end * 1000) 
        : null;

      await prisma.$transaction([
        prisma.subscription.update({
          where: { farmId },
          data: { status: "ACTIVE" },
        }),
        prisma.payment.create({
          data: {
            farmId,
            amount: invoice.amount_paid / 100, // Stripe amount is in cents
            status: "SUCCESS",
            paymentDate: new Date(),
            planId,
            planName,
            priceType,
            periodEnd,
            stripeInvoiceId: invoice.id,
            invoicePdfUrl: invoice.invoice_pdf,
          },
        }),
      ]);
    }
  } else if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;
    const farmId = invoice.subscription_details?.metadata?.farmId || invoice.metadata?.farmId;

    if (farmId) {
      const farm = await prisma.farm.findUnique({
        where: { id: farmId },
      });

      await prisma.systemAlert.create({
        data: {
          type: "PAYMENT_FAILED",
          message: `Payment failed for farm "${farm?.name || "Unknown"}"`,
          farmId: farmId,
        },
      });
    }
  }

  return { received: true };
};

export const PaymentService = {
  createCheckoutSession,
  handleWebhook,
};
