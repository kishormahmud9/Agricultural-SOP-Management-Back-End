import { HomeService } from "./home.service.js";

/**
 * TEMP: hard-coded farmId
 * Replace later with req.user.farmId
 */
const FARM_ID = "9581f927-4563-4808-8514-94f87840d0e8"; // 👈 REAL farmId

const getHome = async (req, res) => {
  try {
    const data = await HomeService.getHome(FARM_ID);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("HOME_CONTROLLER_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};

/**
 * View All → Today's tasks
 */
const getAllTodayTasks = async (req, res) => {
  try {
    const tasks = await HomeService.getAllTodayTasks(FARM_ID);

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("HOME_TASK_ALL_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load tasks",
    });
  }
};

export const HomeController = {
  getHome,
  getAllTodayTasks,
};
