import express from "express";
import { HomeController } from "./home.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = express.Router();

router.get(
  "/",
  checkAuthMiddleware(Role.EMPLOYEE),
  HomeController.getDashboard,
);

router.get(
  "/view-all-tasks",
  checkAuthMiddleware(Role.EMPLOYEE),
  HomeController.getAllTasks,
);

router.get(
  "/view-sops",
  checkAuthMiddleware(Role.EMPLOYEE),
  HomeController.getSopModules,
);

export default router;
