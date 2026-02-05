import { Router } from "express";
import { EmployeeAuthController } from "./auth.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";

const router = Router();

router.post("/login", EmployeeAuthController.loginEmployee);

router.post("/forgot-password", EmployeeAuthController.forgotPassword);

router.post("/verify-otp", EmployeeAuthController.verifyForgotPasswordOtp);

router.post(
  "/reset-password",
  checkAuthMiddleware(),
  EmployeeAuthController.resetPassword,
);

export const EmployeeAuthRoutes = router;
