import { HomeService } from "./home.service.js";

const getHome = async (req, res) => {
  try {
    const data = await HomeService.getHome(req.user.farmId);

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
    const tasks = await HomeService.getAllTodayTasks(req.user.farmId);

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
