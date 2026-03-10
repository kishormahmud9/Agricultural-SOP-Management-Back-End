import prisma from "../../../prisma/client.js";
import { addDays, startOfDay, endOfDay } from "date-fns";

export const AlertService = {
  async generateDailyAlerts() {
    const now = new Date();
    const threeDaysLater = addDays(now, 3);
    const tomorrow = addDays(now, 1);

    await Promise.all([
      this.checkExpiringSubscriptions(threeDaysLater),
      this.checkExpiringTrials(tomorrow),
    ]);
  },

  async checkExpiringSubscriptions(targetDate) {
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);

    // Find subscriptions expiring on this day
    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        farm: true,
      },
    });

    for (const sub of expiringSubscriptions) {
      const alertMessage = `Farm "${sub.farm.name}" subscription expires in 3 days`;
      
      // Check if alert already exists for this farm today
      const existingAlert = await prisma.systemAlert.findFirst({
        where: {
          farmId: sub.farmId,
          type: "SUBSCRIPTION_EXPIRING",
          message: alertMessage,
          createdAt: {
            gte: startOfDay(new Date()),
          },
        },
      });

      if (!existingAlert) {
        await prisma.systemAlert.create({
          data: {
            type: "SUBSCRIPTION_EXPIRING",
            message: alertMessage,
            farmId: sub.farmId,
          },
        });
      }
    }
  },

  async checkExpiringTrials(targetDate) {
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);

    // Find trial farms expiring on this day
    const expiringTrials = await prisma.subscription.findMany({
      where: {
        status: "TRIAL",
        endDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        farm: true,
      },
    });

    for (const sub of expiringTrials) {
      const alertMessage = `Trial version for farm "${sub.farm.name}" will expire tomorrow`;
      
      // Check if alert already exists for this farm today
      const existingAlert = await prisma.systemAlert.findFirst({
        where: {
          farmId: sub.farmId,
          type: "SUBSCRIPTION_EXPIRING", // Using same type or could add a TRIAL_EXPIRING type if needed
          message: alertMessage,
          createdAt: {
            gte: startOfDay(new Date()),
          },
        },
      });

      if (!existingAlert) {
        await prisma.systemAlert.create({
          data: {
            type: "SUBSCRIPTION_EXPIRING",
            message: alertMessage,
            farmId: sub.farmId,
          },
        });
      }
    }
  },
};
