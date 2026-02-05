import { FarmService } from "./farm.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";

export const FarmController = {
  async getFarms(req, res, next) {
    try {
      const farms = await FarmService.getAllFarms();

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Farms retrieved successfully",
        data: { farms },
      });
    } catch (error) {
      next(error);
    }
  },

  async createFarm(req, res, next) {
    try {
      const { name, adminName, adminEmail, password, country, defaultLanguage } = req.body;

      if (!name || !adminName || !adminEmail || !password || !country || !defaultLanguage) {
        return sendResponse(res, {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "All fields are required",
          data: null,
        });
      }

      const result = await FarmService.createFarm({
        name,
        adminName,
        adminEmail,
        password,
        country,
        defaultLanguage,
      });

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Farm and Farm Admin created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getFarmDetails(req, res, next) {
    try {
      const { farmId } = req.params;

      const farm = await FarmService.getFarmById(farmId);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Farm details retrieved successfully",
        data: farm,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateFarmStatus(req, res, next) {
    try {
      const { farmId } = req.params;
      const { status } = req.body;

      await FarmService.updateFarmStatus(farmId, status);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message:
          status === "INACTIVE"
            ? "Farm suspended successfully"
            : "Farm activated successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteFarm(req, res, next) {
    try {
      const { farmId } = req.params;

      await FarmService.deleteFarm(farmId);

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Farm deleted successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },
};
