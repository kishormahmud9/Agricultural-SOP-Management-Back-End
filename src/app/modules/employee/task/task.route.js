import { Router } from "express";
import { TaskController } from "./task.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get("/", checkAuthMiddleware(Role.EMPLOYEE), TaskController.getMyTasks);

// Task details page
router.get(
  "/:taskId",
  checkAuthMiddleware(Role.EMPLOYEE),
  TaskController.getTaskDetails,
);

// Mark task as complete
router.patch(
  "/:taskId/complete",
  checkAuthMiddleware(Role.EMPLOYEE),
  TaskController.completeTask,
);

export default router;
