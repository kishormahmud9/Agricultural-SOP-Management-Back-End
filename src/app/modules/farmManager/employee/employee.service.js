import prisma from "../../../prisma/client.js";
import dayjs from "dayjs";

const getEmployees = async (farmId, query) => {
  const { status, search } = query;

  const employees = await prisma.user.findMany({
    where: {
      farmId,
      role: "EMPLOYEE",
      ...(status && status !== "ALL" ? { status } : {}),
      ...(search
        ? {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true,
    },
  });

  const employeeIds = employees.map((e) => e.id);

  const taskStats = await prisma.task.groupBy({
    by: ["assignedToId", "status"],
    where: {
      assignedToId: { in: employeeIds },
    },
    _count: true,
  });

  return employees.map((emp) => {
    const stats = taskStats.filter((t) => t.assignedToId === emp.id);

    const tasksDone = stats.find((s) => s.status === "COMPLETED")?._count ?? 0;

    const currentTasks = stats
      .filter((s) => s.status !== "COMPLETED")
      .reduce((sum, s) => sum + s._count, 0);

    return {
      id: emp.id,
      name: emp.name,
      role: "Farm Worker", // later from profile/field
      email: emp.email,
      status: emp.status,
      joinedAt: emp.createdAt,
      tasksDone,
      currentTasks,
    };
  });
};

const getEmployeeDetails = async (farmId, employeeId) => {
  // 1️⃣ Fetch employee basic info
  const employee = await prisma.user.findFirst({
    where: {
      id: employeeId,
      farmId,
      role: "EMPLOYEE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true,
      jobTitle: true,
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  // 2️⃣ Fetch task stats
  const stats = await prisma.task.groupBy({
    by: ["status"],
    where: {
      assignedToId: employeeId,
    },
    _count: true,
  });

  const completed = stats.find((s) => s.status === "COMPLETED")?._count ?? 0;

  const currentTasks = stats
    .filter((s) => s.status !== "COMPLETED")
    .reduce((sum, s) => sum + s._count, 0);

  return {
    id: employee.id,
    name: employee.name,
    role: employee.jobTitle ?? "—",
    email: employee.email,
    status: employee.status,
    joinedAt: employee.createdAt,
    stats: {
      currentTasks,
      completed,
      total: currentTasks + completed,
    },
  };
};

const getEmployeeTasks = async (farmId, employeeId, type = "CURRENT") => {
  const statusFilter =
    type === "COMPLETED"
      ? { status: "COMPLETED" }
      : { status: { not: "COMPLETED" } };

  const tasks = await prisma.task.findMany({
    where: {
      farmId,
      assignedToId: employeeId,
      ...statusFilter,
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });

  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    time: dayjs(task.scheduledAt).format("hh:mm A"),
    shift: task.shift,
    status: task.status,
  }));
};

export const EmployeeService = {
  getEmployees,
  getEmployeeDetails,
  getEmployeeTasks,
};
