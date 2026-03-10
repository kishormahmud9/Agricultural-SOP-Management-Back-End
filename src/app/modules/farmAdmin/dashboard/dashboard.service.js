import prisma from "../../../prisma/client.js";

const getDashboardStats = async (farmId) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalEmployees,
      employeesThisMonth,
      totalSOPs,
      sopsUpdatedToday,
      totalTasks,
      completedTasks,
      todayMessages,
      unreadMessages,
      subscription
    ] = await Promise.all([
      // 👥 Total Users (Employees + Managers)
      prisma.user.count({
        where: { farmId, role: { in: ["EMPLOYEE", "MANAGER"] } }
      }),
      prisma.user.count({
        where: {
          farmId,
          role: "EMPLOYEE",
          createdAt: { gte: startOfMonth }
        }
      }),

      // 📄 SOPs
      prisma.sOP.count({
        where: { farmId }
      }),
      prisma.sOP.count({
        where: {
          farmId,
          updatedAt: { gte: startOfToday }
        }
      }),

      // ✅ Tasks
      prisma.task.count({
        where: { farmId }
      }),
      prisma.task.count({
        where: { farmId, status: "COMPLETED" }
      }),

      // 💬 Messages
      prisma.message.count({
        where: {
          farmId,
          createdAt: { gte: startOfToday }
        }
      }),
      prisma.message.count({
        where: {
          farmId,
          isRead: false
        }
      }),

      // 🧾 Subscription + Plan
      prisma.subscription.findUnique({
        where: { farmId },
        select: {
          status: true,
          endDate: true,
          plan: {
            select: {
              name: true,
              employeeLimit: true
            }
          }
        }
      })
    ]);

    return {
      stats: {
        users: {
          total: totalEmployees,
          addedThisMonth: employeesThisMonth
        },
        sops: {
          total: totalSOPs,
          updatedToday: sopsUpdatedToday
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks
        },
        messages: {
          today: todayMessages,
          unread: unreadMessages
        }
      },

      subscription: subscription
        ? {
            plan: subscription.plan.name,
            status: subscription.status,
            employeeLimit: subscription.plan.employeeLimit >= 9999 ? "Unlimited" : subscription.plan.employeeLimit,
            currentUsers: totalEmployees,
            remainingUsers:
              subscription.plan.employeeLimit >= 9999 
                ? "Unlimited" 
                : subscription.plan.employeeLimit - totalEmployees,
            nextBillingDate: subscription.endDate
          }
        : {
            plan: null,
            status: "INACTIVE",
            employeeLimit: 0,
            currentEmployees: totalEmployees,
            remainingEmployees: 0,
            nextBillingDate: null
          }
    };
  } catch (error) {
    console.error("Dashboard Service Error:", error);
    throw error; // controller will handle response
  }
};

export const DashboardService = {
  getDashboardStats
};
