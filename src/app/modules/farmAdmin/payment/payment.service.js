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
    endDate.setDate(startDate.getDate() + durationDays);

    // Update or create subscription
    await prisma.$transaction([
      prisma.subscription.upsert({
        where: { farmId: farmId },
        update: {
          planId: planId,
          status: "ACTIVE",
          startDate,
          endDate,
          price,
          priceType,
        },
        create: {
          farmId,
          planId,
          status: "ACTIVE",
          startDate,
          endDate,
          price,
          priceType,
        },
      }),
      prisma.payment.create({
        data: {
          farmId,
          amount: price,
          status: "SUCCESS",
          paymentDate: new Date(),
        },
      }),
      prisma.farm.update({
        where: { id: farmId },
        data: { status: "ACTIVE" },
      }),
    ]);
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
