import { HomeService } from "./home.service.js";

const getDashboard = async (req, res, next) => {
  try {
    const { id: employeeId, farmId } = req.user;

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
    const { id: employeeId, farmId } = req.user;

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
    const { farmId } = req.user;

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
