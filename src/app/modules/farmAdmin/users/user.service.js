import prisma from "../../../prisma/client.js";
import bcrypt from "bcrypt";

const getUsers = async (farmId, search) => {
    const where = {
        farmId,
        OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } }
        ]
    };

    const users = await prisma.user.findMany({
        where,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true
        },
        orderBy: { createdAt: "desc" }
    });

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === "ACTIVE").length;
    const managers = users.filter(u => u.role === "MANAGER").length;

    return {
        summary: {
            totalUsers,
            activeUsers,
            managers
        },
        users
    };
};

const updateUserStatus = async (farmId, userId, status) => {
    const user = await prisma.user.findFirst({
        where: { id: userId, farmId }
    });

    if (!user) throw new Error("User not found");

    if (["SYSTEM_OWNER", "FARM_ADMIN"].includes(user.role)) {
        throw new Error("Cannot change status of this user");
    }

    await prisma.user.update({
        where: { id: userId },
        data: { status }
    });
};

const updateUser = async (farmId, userId, payload) => {
    const { name, email, role } = payload;

    const user = await prisma.user.findFirst({
        where: { id: userId, farmId }
    });

    if (!user) throw new Error("User not found");

    // ❌ Protect high-privilege roles
    if (["SYSTEM_OWNER", "FARM_ADMIN"].includes(user.role)) {
        throw new Error("Cannot edit this user");
    }

    // ❌ Prevent role escalation
    if (role && !["EMPLOYEE", "MANAGER"].includes(role)) {
        throw new Error("Invalid role");
    }

    // ❌ Email uniqueness check
    if (email && email !== user.email) {
        const exists = await prisma.user.findFirst({
            where: { email }
        });

        if (exists) throw new Error("Email already in use");
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            name: name ?? user.name,
            email: email ?? user.email,
            role: role ?? user.role
        }
    });
};

const deleteUser = async (farmId, userId) => {
    const user = await prisma.user.findFirst({
        where: { id: userId, farmId }
    });

    if (!user) throw new Error("User not found");

    if (["SYSTEM_OWNER", "FARM_ADMIN"].includes(user.role)) {
        throw new Error("Cannot delete this user");
    }

    await prisma.user.delete({
        where: { id: userId }
    });
};

const createUser = async (farmId, payload) => {
    const { name, email, password, role } = payload;

    // ✅ Basic validation
    if (!name || !email || !password || !role) {
        throw new Error("All fields are required");
    }

    if (!["EMPLOYEE", "MANAGER"].includes(role)) {
        throw new Error("Invalid role");
    }

    // ❌ Check duplicate email
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error("Email already exists");
    }

    // 🧾 Check subscription employee limit
    const subscription = await prisma.subscription.findUnique({
        where: { farmId },
        select: {
            plan: {
                select: { employeeLimit: true }
            }
        }
    });

    if (!subscription) {
        throw new Error("No active subscription found");
    }

    const currentEmployeeCount = await prisma.user.count({
        where: {
            farmId,
            role: "EMPLOYEE"
        }
    });

    if (role === "EMPLOYEE" &&
        currentEmployeeCount >= subscription.plan.employeeLimit) {
        throw new Error("Employee limit reached for current plan");
    }

    // 🔐 Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // ✅ Create user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role,
            farmId,
            status: "ACTIVE",
            isVerified: true,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true
        }
    });

    return user;
};

export const UserService = {
    getUsers,
    updateUserStatus,
    updateUser,
    deleteUser,
    createUser
};
