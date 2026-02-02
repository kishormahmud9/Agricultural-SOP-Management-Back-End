import prisma from "../../../prisma/client.js";
import bcrypt from "bcrypt";
import DevBuildError from "../../../lib/DevBuildError.js";
import { StatusCodes } from "http-status-codes";

export const FarmService = {
  // ✅ GET ALL FARMS
  async getAllFarms() {
    const farms = await prisma.farm.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        users: {
          select: {
            email: true,
            role: true,
          },
        },
        subscription: true,
      },
    });

    return farms.map((farm) => {
      const admin = farm.users.find((user) => user.role === "FARM_ADMIN");

      return {
        id: farm.id,
        name: farm.name,
        status: farm.status,
        country: farm.country,
        defaultLanguage: farm.defaultLanguage,
        users: farm.users.length,
        adminEmail: admin?.email || "N/A",
        plan: farm.subscription?.plan || "N/A",
        createdAt: farm.createdAt,
      };
    });
  },

  // ✅ CREATE FARM
  async createFarm(payload) {
    const { name, adminEmail, country, defaultLanguage } = payload;

    return prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email: adminEmail },
      });

      if (existingUser) {
        throw new DevBuildError(
          "Admin email already exists",
          StatusCodes.CONFLICT,
        );
      }

      const farm = await tx.farm.create({
        data: {
          name,
          country,
          defaultLanguage,
          status: "ACTIVE",
        },
      });

      const passwordHash = await bcrypt.hash("admin123", 10);

      await tx.user.create({
        data: {
          name: "Farm Admin",
          email: adminEmail,
          passwordHash,
          role: "FARM_ADMIN",
          farmId: farm.id,
          status: "ACTIVE",
          isVerified: true,
        },
      });

      return {
        farmId: farm.id,
        farmName: farm.name,
        adminEmail,
      };
    });
  },

  // ✅ GET FARM BY ID
  async getFarmById(farmId) {
    const farm = await prisma.farm.findUnique({
      where: { id: farmId },
      include: {
        users: true,
        subscription: true,
      },
    });

    if (!farm) {
      throw new DevBuildError("Farm not found", StatusCodes.NOT_FOUND);
    }

    const admin = farm.users.find((user) => user.role === "FARM_ADMIN");

    return {
      id: farm.id,
      name: farm.name,
      status: farm.status,
      adminEmail: admin?.email || "N/A",
      country: farm.country,
      language: farm.defaultLanguage,
      createdAt: farm.createdAt,
      totalUsers: farm.users.length,
      plan: farm.subscription?.plan || "Basic",
      employeeLimit: 50,
    };
  },

  // ✅ SUSPEND / ACTIVATE FARM
  async updateFarmStatus(farmId, status) {
    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      throw new DevBuildError("Invalid farm status", StatusCodes.BAD_REQUEST);
    }

    const farm = await prisma.farm.findUnique({
      where: { id: farmId },
    });

    if (!farm) {
      throw new DevBuildError("Farm not found", StatusCodes.NOT_FOUND);
    }

    return prisma.farm.update({
      where: { id: farmId },
      data: { status },
    });
  },

  async deleteFarm(farmId) {
    const farm = await prisma.farm.findUnique({
      where: { id: farmId },
      include: {
        subscription: true,
      },
    });

    if (!farm) {
      throw new DevBuildError("Farm not found", StatusCodes.NOT_FOUND);
    }

    // ❌ If farm has a running plan, block delete
    if (
      farm.subscription &&
      ["ACTIVE", "TRIAL"].includes(farm.subscription.status)
    ) {
      throw new DevBuildError(
        "Cannot delete farm with an active subscription",
        StatusCodes.BAD_REQUEST,
      );
    }

    // ✅ Safe to delete
    await prisma.$transaction(async (tx) => {
      await tx.user.deleteMany({
        where: { farmId },
      });

      await tx.subscription?.deleteMany({
        where: { farmId },
      });

      await tx.farm.delete({
        where: { id: farmId },
      });
    });

    return true;
  },
};
