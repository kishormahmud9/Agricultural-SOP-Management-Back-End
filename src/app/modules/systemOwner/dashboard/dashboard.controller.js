import { DashboardService } from "./dashboard.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";

export const DashboardController = {
  async getDashboard(req, res, next) {
    try {
      const data = await DashboardService.getDashboardData();

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "System Owner dashboard data retrieved successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
