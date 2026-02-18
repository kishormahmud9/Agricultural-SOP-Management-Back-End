import prisma from "../../../prisma/client.js";
import dayjs from "dayjs";

const getDashboard = async (employeeId, farmId) => {
  const startOfDay = dayjs().startOf("day").toDate();
  const endOfDay = dayjs().endOf("day").toDate();

  // Employee basic info
  const employee = await prisma.user.findUnique({
    where: {
      id: employeeId,
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      role: true,
      farm: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const employeeInfo = {
    id: employee.id,
    name: employee.name,
    avatarUrl: employee.avatarUrl,
    role: employee.role,
    farmName: employee.farm?.name || null,
  };

  // Today's tasks count
  const todaysTasks = await prisma.task.count({
    where: {
      assignedToId: employeeId,
      farmId,
      scheduledAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  // Recent completed tasks (activity)
  const completedTasks = await prisma.task.findMany({
    where: {
      assignedToId: employeeId,
      farmId,
      status: "COMPLETED",
      completedAt: {
        not: null,
      },
    },
    orderBy: {
      completedAt: "desc",
    },
    take: 5,
    select: {
      id: true,
      title: true,
      completedAt: true,
    },
  });

  const recentActivity = completedTasks.map((task) => ({
    id: task.id,
    title: `${task.title} Completed`,
    time: dayjs(task.completedAt).format("h:mm A"), // e.g., "6:00 AM"
    completedAt: task.completedAt,
  }));

  return {
    employee: employeeInfo,
    stats: {
      todaysTasks,
    },
    recentActivity,
  };
};

const getAllTasks = async (employeeId, farmId) => {
  const tasks = await prisma.task.findMany({
    where: {
      assignedToId: employeeId,
      farmId,
    },
    orderBy: [
      { status: "asc" }, // PENDING first
      { scheduledAt: "asc" }, // earlier tasks first
    ],
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      scheduledAt: true,
      completedAt: true,
      shift: true,
      completions: {
        select: {
          note: true,
        },
        orderBy: {
          completedAt: "desc",
        },
        take: 1,
      },
    },
  });

  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    scheduledAt: task.scheduledAt,
    completedAt: task.completedAt,
    shift: task.shift,
    completionNote: task.completions?.[0]?.note || null,
  }));
};

const getSopModules = async (farmId) => {
  const grouped = await prisma.sOP.groupBy({
    by: ["category"],
    where: {
      farmId,
      isActive: true,
    },
    _count: {
      _all: true,
    },
    orderBy: {
      category: "asc",
    },
  });

  return grouped.map((item) => ({
    module: item.category,
    count: item._count._all,
  }));
};

export const HomeService = {
  getDashboard,
  getAllTasks,
  getSopModules,
};
