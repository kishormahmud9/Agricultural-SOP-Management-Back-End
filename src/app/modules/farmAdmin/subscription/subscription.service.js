import prisma from "../../../prisma/client.js";

const getCurrentSubscription = async (req) => {
    const { role, farmId } = req.user;

    if (role !== "FARM_ADMIN") {
        throw new Error("Access denied");
    }

    if (!farmId) {
        throw new Error("Farm context missing");
    }

    const subscription = await prisma.subscription.findUnique({
        where: { farmId },
        include: {
            plan: {
                select: {
                    name: true,
                    priceMonthly: true,
                    priceYearly: true,
                    trialDays: true,
                    employeeLimit: true
                }
            }
        }
    });

    if (!subscription) {
        return {
            status: "NO_SUBSCRIPTION",
            message: "No active subscription found"
        };
    }

    return {
        plan: subscription.plan.name,
        status: subscription.status,
        price: subscription.price,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        trialDays: subscription.plan.trialDays
    };
};

const getAvailablePlans = async () => {
    const plans = await prisma.plan.findMany({
        where: { isActive: true },
        orderBy: { priceMonthly: "asc" },
        select: {
            id: true,
            name: true,
            priceMonthly: true,
            priceYearly: true,
            employeeLimit: true,
            trialDays: true
        }
    });

    return plans;
};

const getBillingHistory = async (req) => {
    const { role, farmId } = req.user;

    if (role !== "FARM_ADMIN") {
        throw new Error("Access denied");
    }

    if (!farmId) {
        throw new Error("Farm context missing");
    }

    const payments = await prisma.payment.findMany({
        where: { farmId },
        orderBy: { paymentDate: "desc" }
    });

    return payments.map((payment) => ({
        billingDate: payment.paymentDate,
        amount: payment.amount,
        status: payment.status === "SUCCESS" ? "Paid" : "Unpaid"
    }));
};

export const SubscriptionService = {
    getCurrentSubscription,
    getAvailablePlans,
    getBillingHistory
};
