import { Router } from "express";
import { HomeController } from "./home.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get("/", HomeController.getHome);

router.get("/task-all", HomeController.getAllTodayTasks);

export default router;
