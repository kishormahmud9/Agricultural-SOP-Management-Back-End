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
      jobTitle: true,
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

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
  const recentActivity = await prisma.task.findMany({
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

  return {
    employee,
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
    },
  });

  return tasks;
};

const getSopModules = async (farmId) => {
  const grouped = await prisma.sOP.groupBy({
    by: ["module"],
    where: {
      farmId,
      isActive: true,
    },
    _count: {
      _all: true,
    },
    orderBy: {
      module: "asc",
    },
  });

  return grouped.map((item) => ({
    module: item.module,
    count: item._count._all,
  }));
};

export const HomeService = {
  getDashboard,
  getAllTasks,
  getSopModules,
};
