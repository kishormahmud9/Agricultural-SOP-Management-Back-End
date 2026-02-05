import { TaskService } from "./task.service.js";

const getMyTasks = async (req, res) => {
  try {
    const { id: employeeId } = req.user;
    const { type } = req.query;

    // Dev mode validation
    if (!type) {
      return res.status(400).json({
        success: false,
        message: "type is required",
        data: {
          progress: null,
          tasks: [],
        },
      });
    }

    const result = await TaskService.getMyTasks(employeeId, type);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // ❗ DO NOT crash server
    console.error("Get My Tasks Error:", error.message);

    return res.status(200).json({
      success: false,
      message: "Unable to load tasks right now",
      data: {
        progress: null,
        tasks: [],
      },
    });
  }
};

const getTaskDetails = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await TaskService.getTaskDetails(taskId);

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Task Details Error:", error.message);

    return res.status(200).json({
      success: false,
      message: "Unable to load task details",
      data: null,
    });
  }
};

/**
 * Mark task as complete
 */
const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { id: employeeId } = req.user;
    const { note } = req.body;

    const result = await TaskService.completeTask(taskId, employeeId, note);

    return res.status(200).json({
      success: true,
      message: "Task marked as completed",
      data: result,
    });
  } catch (error) {
    console.error("Complete Task Error:", error.message);

    return res.status(200).json({
      success: false,
      message: "Unable to complete task",
      data: null,
    });
  }
};

export const TaskController = {
  getMyTasks,
  getTaskDetails,
  completeTask,
};
