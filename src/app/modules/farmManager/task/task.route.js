import { Router } from "express";
import { TaskController } from "./task.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.post("/", checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER), TaskController.createTask);

router.get("/", checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER), TaskController.getTasks);

router.patch("/:id/status", checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER), TaskController.updateTaskStatus);

router.delete("/:id", checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER), TaskController.deleteTask);

router.patch("/:id", checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER), TaskController.updateTask);


export default router;
