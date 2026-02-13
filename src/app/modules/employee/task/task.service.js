import prisma from "../../../prisma/client.js";
import dayjs from "dayjs";

const getMyTasks = async (employeeId, type) => {
  try {
    const todayStart = dayjs().startOf("day").toDate();
    const todayEnd = dayjs().endOf("day").toDate();

    let whereCondition = {
      assignedToId: employeeId,
    };

    // 🔸 TODAY
    if (type === "today") {
      whereCondition = {
        ...whereCondition,
        scheduledAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      };
    }

    // 🔸 UPCOMING
    if (type === "upcoming") {
      whereCondition = {
        ...whereCondition,
        scheduledAt: {
          gt: todayEnd,
        },
        status: {
          not: "COMPLETED",
        },
      };
    }

    // 🔸 COMPLETED
    if (type === "completed") {
      whereCondition = {
        ...whereCondition,
        status: "COMPLETED",
      };
    }

    const tasks = await prisma.task.findMany({
      where: whereCondition,
      orderBy: {
        scheduledAt: "asc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        scheduledAt: true,
        shift: true,
        status: true,
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

    // 🔸 Progress (only for today tab)
    let progress = null;

    if (type === "today") {
      const total = await prisma.task.count({
        where: {
          assignedToId: employeeId,
          scheduledAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      });

      const completed = await prisma.task.count({
        where: {
          assignedToId: employeeId,
          scheduledAt: {
            gte: todayStart,
            lte: todayEnd,
          },
          status: "COMPLETED",
        },
      });

      progress = {
        completed,
        total,
      };
    }

    // Map tasks to include completionNote
    const tasksWithNotes = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      scheduledAt: task.scheduledAt,
      shift: task.shift,
      status: task.status,
      completionNote: task.completions?.[0]?.note || null,
    }));

    return {
      progress,
      tasks: tasksWithNotes,
    };
  } catch (error) {
    console.error("Task Service Error:", error.message);

    // ❗ Never throw → always return safe data
    return {
      progress: null,
      tasks: [],
    };
  }
};

const getTaskDetails = async (taskId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      title: true,
      description: true,
      scheduledAt: true,
      shift: true,
      status: true,
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

  if (!task) {
    throw new Error("Task not found");
  }

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    time: task.scheduledAt,
    shift: task.shift,
    status: task.status,
    isCompleted: task.status === "COMPLETED",
    completionNote: task.completions?.[0]?.note || null,
  };
};

/**
 * Mark task as completed
 */
const completeTask = async (taskId, employeeId, note) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error("Task not found");
    }

    // If already completed → do nothing
    if (task.status === "COMPLETED") {
      return {
        id: task.id,
        status: task.status,
        alreadyCompleted: true,
      };
    }

    // 1️⃣ Update task status
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 2️⃣ Store completion note
    await prisma.taskCompletion.create({
      data: {
        taskId,
        completedBy: employeeId,
        note: note || null,
      },
    });

    return {
      id: taskId,
      status: "COMPLETED",
      alreadyCompleted: false,
      note: note || null,
    };
  } catch (error) {
    console.error("Task Completion Service Error:", error.message);

    // ❗ Never throw → safe return
    return {
      id: taskId,
      status: "FAILED",
    };
  }
};

export const TaskService = {
  getMyTasks,
  getTaskDetails,
  completeTask,
};
