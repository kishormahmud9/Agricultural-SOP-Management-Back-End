import { Router } from "express";
import { TaskController } from "./task.controller.js";

const router = Router();

router.get("/", TaskController.getMyTasks);

// Task details page
router.get("/:taskId", TaskController.getTaskDetails);

// Mark task as complete
router.patch("/:taskId/complete", TaskController.completeTask);

export default router;
