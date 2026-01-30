import { PlanService } from "./plan.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";

export const PlanController = {
  // ✅ CREATE PLAN
  async createPlan(req, res, next) {
    try {
      const plan = await PlanService.createPlan(req.body);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Plan created successfully",
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  },

  // ✅ GET ALL PLANS
  async getPlans(req, res, next) {
    try {
      const plans = await PlanService.getAllPlans();

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Plans retrieved successfully",
        data: { plans },
      });
    } catch (error) {
      next(error);
    }
  },

  // ✅ UPDATE PLAN
  async updatePlan(req, res, next) {
    try {
      const { planId } = req.params;

      const plan = await PlanService.updatePlan(planId, req.body);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Plan updated successfully",
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  },

  // ✅ DELETE PLAN
  async deletePlan(req, res, next) {
    try {
      const { planId } = req.params;

      await PlanService.deletePlan(planId);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Plan deleted successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },
};
