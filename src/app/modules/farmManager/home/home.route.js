import { Router } from "express";
import { HomeController } from "./home.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get("/", checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER), HomeController.getHome);

router.get("/task-all", checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER), HomeController.getAllTodayTasks);

export default router;
