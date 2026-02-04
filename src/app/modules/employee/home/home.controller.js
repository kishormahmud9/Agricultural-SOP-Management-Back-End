import { HomeService } from "./home.service.js";

const getDashboard = async (req, res, next) => {
  try {
    // TEMP: auth will replace this later
    const { employeeId, farmId } = req.query;

    if (!employeeId || !farmId) {
      return res.status(400).json({
        success: false,
        message: "employeeId and farmId are required (dev mode)",
      });
    }

    const result = await HomeService.getDashboard(employeeId, farmId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const { employeeId, farmId } = req.query;

    if (!employeeId || !farmId) {
      return res.status(400).json({
        success: false,
        message: "employeeId and farmId are required (dev mode)",
      });
    }

    const result = await HomeService.getAllTasks(employeeId, farmId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getSopModules = async (req, res, next) => {
  try {
    const { farmId } = req.query;

    if (!farmId) {
      return res.status(400).json({
        success: false,
        message: "farmId is required (dev mode)",
      });
    }

    const result = await HomeService.getSopModules(farmId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const HomeController = {
  getDashboard,
  getAllTasks,
  getSopModules,
};
