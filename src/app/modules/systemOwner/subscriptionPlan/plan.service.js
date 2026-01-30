import prisma from "../../../prisma/client.js";
import DevBuildError from "../../../lib/DevBuildError.js";
import { StatusCodes } from "http-status-codes";

export const PlanService = {
  // ✅ CREATE PLAN
  async createPlan(payload) {
    const existing = await prisma.plan.findUnique({
      where: { name: payload.name },
    });

    if (existing) {
      throw new DevBuildError(
        "Plan with this name already exists",
        StatusCodes.CONFLICT,
      );
    }

    return prisma.plan.create({
      data: payload,
    });
  },

  // ✅ GET ALL PLANS (WITH USAGE COUNT)
  async getAllPlans() {
    const plans = await prisma.plan.findMany({
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
      orderBy: { priceMonthly: "asc" },
    });

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      employeeLimit: plan.employeeLimit,
      storageLimitGB: plan.storageLimitGB,
      trialDays: plan.trialDays,
      isActive: plan.isActive,
      farmsUsing: plan._count.subscriptions,
      createdAt: plan.createdAt,
    }));
  },

  // ✅ UPDATE PLAN
  async updatePlan(planId, payload) {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new DevBuildError("Plan not found", StatusCodes.NOT_FOUND);
    }

    return prisma.plan.update({
      where: { id: planId },
      data: payload,
    });
  },

  // ✅ DELETE PLAN (ONLY IF UNUSED)
  async deletePlan(planId) {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        subscriptions: true,
      },
    });

    if (!plan) {
      throw new DevBuildError("Plan not found", StatusCodes.NOT_FOUND);
    }

    if (plan.subscriptions.length > 0) {
      throw new DevBuildError(
        "Cannot delete plan that is in use",
        StatusCodes.BAD_REQUEST,
      );
    }

    await prisma.plan.delete({
      where: { id: planId },
    });

    return true;
  },
};
