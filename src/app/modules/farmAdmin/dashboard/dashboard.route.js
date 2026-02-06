import express from "express";
import { DashboardController } from "./dashboard.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = express.Router();

router.get(
  "/",
  checkAuthMiddleware(Role.FARM_ADMIN),
  DashboardController.getDashboard
);

export default router;
