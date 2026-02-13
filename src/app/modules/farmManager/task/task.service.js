import prisma from "../../../prisma/client.js";
import dayjs from "dayjs";

const createTask = async ({
  title,
  description,
  assignedToId,
  scheduledAt,
  shift,
  sopId,
  farmId,
  createdById,
}) => {
  if (!title) throw new Error("Task title is required");
  if (!assignedToId) throw new Error("Employee is required");
  if (!shift) throw new Error("Shift is required");

  const date = new Date(scheduledAt);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid scheduled date");
  }

  return prisma.task.create({
    data: {
      title,
      description,
      scheduledAt: date,
      shift,
      status: "PENDING",
      farmId,
      createdById,
      assignedToId,
      sopId,
    },
  });
};

const getTasks = async (farmId, query) => {
  const { status, search } = query;

  const tasks = await prisma.task.findMany({
    where: {
      farmId,
      ...(status && status !== "ALL" ? { status } : {}),
      ...(search
        ? {
          title: {
            contains: search,
            mode: "insensitive",
          },
        }
        : {}),
    },
    include: {
      assignedTo: { select: { name: true } },
      completions: {
        select: { note: true },
        orderBy: { completedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return tasks.map((task) => ({
    ...task,
    note: task.completions[0]?.note || null,
    completions: undefined,
  }));
};

const updateTaskStatus = async (taskId, status) => {
  if (!["PENDING", "COMPLETED"].includes(status)) {
    throw new Error("Invalid status");
  }

  return prisma.task.update({
    where: { id: taskId },
    data: {
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });
};

const deleteTask = async (taskId) => {
  return prisma.task.delete({ where: { id: taskId } });
};

const updateTask = async (taskId, payload) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // Validate scheduledAt if provided
  if (payload.scheduledAt) {
    const date = new Date(payload.scheduledAt);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid scheduled date");
    }
    payload.scheduledAt = date;
  }

  return prisma.task.update({
    where: { id: taskId },
    data: {
      title: payload.title,
      description: payload.description,
      assignedToId: payload.assignedToId,
      scheduledAt: payload.scheduledAt,
      shift: payload.shift,
      sopId: payload.sopId,
      status: "PENDING",
    },
  });
};

export const TaskService = {
  createTask,
  getTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
};
