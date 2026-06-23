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
        subscription: {
          include: {
            plan: true,
          },
        },
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
        plan: farm.subscription?.plan?.name || "N/A",
        planDuration: farm.subscription?.priceType || "N/A",
        createdAt: farm.createdAt,
      };
    });
  },

  // ✅ CREATE FARM
  async createFarm(payload) {
    const { name, adminName, adminEmail, password, country, defaultLanguage, plan, startDate, endDate } = payload;

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

      // Find the selected plan
      const planRecord = await tx.plan.findFirst({
        where: {
          OR: [
            { id: plan },
            { name: { equals: plan, mode: "insensitive" } },
          ],
        },
      });

      if (!planRecord) {
        throw new DevBuildError(
          "Selected plan not found",
          StatusCodes.BAD_REQUEST,
        );
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new DevBuildError(
          "Invalid start date or end date format",
          StatusCodes.BAD_REQUEST,
        );
      }

      if (start >= end) {
        throw new DevBuildError(
          "Start date must be before end date",
          StatusCodes.BAD_REQUEST,
        );
      }

      // Calculate diff in days to decide monthly vs yearly pricing
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let price = planRecord.priceMonthly;
      let priceType = "monthly";
      if (diffDays >= 360) {
        price = planRecord.priceYearly;
        priceType = "yearly";
      }

      const farm = await tx.farm.create({
        data: {
          name,
          country,
          defaultLanguage,
          status: "ACTIVE",
        },
      });

      const passwordHash = await bcrypt.hash(password, 10);

      const admin = await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          passwordHash,
          role: "FARM_ADMIN",
          farmId: farm.id,
          status: "ACTIVE",
          isVerified: true,
        },
      });

      // Create subscription for the farm
      const subscription = await tx.subscription.create({
        data: {
          farmId: farm.id,
          planId: planRecord.id,
          status: "ACTIVE",
          startDate: start,
          endDate: end,
          price,
          priceType,
        },
      });

      return {
        farmId: farm.id,
        farmName: farm.name,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
        },
        subscription: {
          id: subscription.id,
          planId: planRecord.id,
          planName: planRecord.name,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          price: subscription.price,
          priceType: subscription.priceType,
        },
      };
    });
  },

  // ✅ GET FARM BY ID
  async getFarmById(farmId) {
    const farm = await prisma.farm.findUnique({
      where: { id: farmId },
      include: {
        users: true,
        subscription: {
          include: {
            plan: true,
          },
        },
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
      plan: farm.subscription?.plan?.name || "N/A",
      planDuration: farm.subscription?.priceType || "N/A",
      employeeLimit: farm.subscription?.plan?.employeeLimit || 0,
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
