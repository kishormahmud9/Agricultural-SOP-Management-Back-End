import prisma from "../../../prisma/client.js";
import dayjs from "dayjs";

const getHome = async (farmId) => {
  try {
    const startOfDay = dayjs().startOf("day").toDate();
    const endOfDay = dayjs().endOf("day").toDate();

    const [totalTasks, pendingTasks, unreadMessages, activeSops] =
      await Promise.allSettled([
        prisma.task.count({ where: { farmId } }),
        prisma.task.count({ where: { farmId, status: "PENDING" } }),
        prisma.message.count({ where: { farmId, isRead: false } }),
        prisma.sOP.count({ where: { farmId, isActive: true } }),
      ]);

    const todayTasks = await prisma.task.findMany({
      where: {
        farmId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        assignedTo: {
          select: { name: true },
        },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    });

    return {
      cards: {
        totalTasks: totalTasks.status === "fulfilled" ? totalTasks.value : 0,
        pending: pendingTasks.status === "fulfilled" ? pendingTasks.value : 0,
        messages:
          unreadMessages.status === "fulfilled" ? unreadMessages.value : 0,
        sops: activeSops.status === "fulfilled" ? activeSops.value : 0,
      },
      todayTasks: todayTasks.map(mapTask),
    };
  } catch (error) {
    console.error("HOME_SERVICE_ERROR:", error);
    return {
      cards: {
        totalTasks: 0,
        pending: 0,
        messages: 0,
        sops: 0,
      },
      todayTasks: [],
    };
  }
};

const getAllTodayTasks = async (farmId) => {
  const startOfDay = dayjs().startOf("day").toDate();
  const endOfDay = dayjs().endOf("day").toDate();

  const tasks = await prisma.task.findMany({
    where: {
      farmId,
      scheduledAt: { gte: startOfDay, lte: endOfDay },
    },
    include: {
      assignedTo: { select: { name: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return tasks.map(mapTask);
};

const mapTask = (task) => ({
  id: task.id,
  title: task.title,
  assignedTo: task.assignedTo?.name ?? "—",
  time: dayjs(task.scheduledAt).format("hh:mm A"),
  status: task.status,
});

export const HomeService = {
  getHome,
  getAllTodayTasks,
};
