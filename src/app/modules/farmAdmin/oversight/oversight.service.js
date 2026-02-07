import prisma from "../../../prisma/client.js";

const getTasks = async (req) => {
    const { role, farmId } = req.user;
    const { search, status, page = 1, limit = 10 } = req.query;

    if (role !== "FARM_ADMIN") {
        throw new Error("Access denied");
    }

    if (!farmId) {
        throw new Error("Farm context missing");
    }

    const skip = (Number(page) - 1) * Number(limit);

    const whereCondition = {
        farmId
    };

    if (status) {
        whereCondition.status = status;
    }

    if (search) {
        whereCondition.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { assignedTo: { name: { contains: search, mode: "insensitive" } } }
        ];
    }

    const [tasks, total] = await Promise.all([
        prisma.task.findMany({
            where: whereCondition,
            skip,
            take: Number(limit),
            orderBy: { createdAt: "desc" },
            include: {
                assignedTo: {
                    select: { id: true, name: true }
                },
                createdBy: {
                    select: { id: true, name: true, role: true }
                }
            }
        }),
        prisma.task.count({ where: whereCondition })
    ]);

    return {
        meta: {
            total,
            page: Number(page),
            limit: Number(limit)
        },
        tasks
    };
};

const getTaskStats = async (req) => {
    const { role, farmId } = req.user;

    if (role !== "FARM_ADMIN") {
        throw new Error("Access denied");
    }

    if (!farmId) {
        throw new Error("Farm context missing");
    }

    const [total, pending, inProgress, completed] = await Promise.all([
        prisma.task.count({ where: { farmId } }),
        prisma.task.count({ where: { farmId, status: "PENDING" } }),
        prisma.task.count({ where: { farmId, status: "IN_PROGRESS" } }),
        prisma.task.count({ where: { farmId, status: "COMPLETED" } })
    ]);

    return {
        total,
        pending,
        inProgress,
        completed
    };
};

export const OversightService = {
    getTasks,
    getTaskStats
};
