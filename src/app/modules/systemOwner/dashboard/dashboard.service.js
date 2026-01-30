import prisma from "../../../prisma/client.js";
import { startOfMonth, endOfMonth } from "date-fns";

export const DashboardService = {
  async getDashboardData() {
    const now = new Date();

    const [
      totalFarms,
      totalUsers,
      activeSubscriptions,
      trialFarms,
      monthlyRevenueResult,
      unreadAlertsCount,
      recentFarms,
      alerts,
    ] = await Promise.all([
      // Total farms
      prisma.farm.count(),

      // Total users
      prisma.user.count(),

      // Active subscriptions
      prisma.subscription.count({
        where: { status: "ACTIVE" },
      }),

      // Trial farms
      prisma.farm.count({
        where: { status: "TRIAL" },
      }),

      // Monthly revenue
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: "SUCCESS",
          paymentDate: {
            gte: startOfMonth(now),
            lte: endOfMonth(now),
          },
        },
      }),

      // System alerts count
      prisma.systemAlert.count({
        where: { isRead: false },
      }),

      // Recent farms
      prisma.farm.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          users: true,
          subscription: true,
        },
      }),

      // Latest alerts
      prisma.systemAlert.findMany({
        where: { isRead: false },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const formattedRecentFarms = recentFarms.map((farm) => ({
      id: farm.id,
      name: farm.name,
      status: farm.status,
      users: farm.users.length,
      plan: farm.subscription?.plan || "N/A",
      revenue: farm.subscription?.price || 0,
    }));

    return {
      metrics: {
        totalFarms,
        activeSubscriptions,
        trialFarms,
        totalUsers,
        monthlyRevenue: monthlyRevenueResult._sum.amount || 0,
        systemAlerts: unreadAlertsCount,
      },
      recentFarms: formattedRecentFarms,
      alerts,
    };
  },
};
