import { TaskService } from "./task.service.js";

// TEMP farmId (auth later)
const FARM_ID = "9581f927-4563-4808-8514-94f87840d0e8";
const MANAGER_ID = "8a925b2b-ead9-47c0-bd96-069d5d2fc496";

const createTask = async (req, res) => {
  try {
    const task = await TaskService.createTask({
      farmId: FARM_ID,
      createdById: MANAGER_ID,
      ...req.body,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error("CREATE_TASK_ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await TaskService.getTasks(FARM_ID, req.query);
    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error("GET_TASKS_ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const task = await TaskService.updateTaskStatus(
      req.params.id,
      req.body.status,
    );

    res.json({ success: true, data: task });
  } catch (error) {
    console.error("UPDATE_TASK_STATUS_ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    await TaskService.deleteTask(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("DELETE_TASK_ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await TaskService.updateTask(req.params.id, req.body);

    res.json({ success: true, data: task });
  } catch (error) {
    console.error("UPDATE_TASK_ERROR:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const TaskController = {
  createTask,
  getTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
};
