import { Router } from "express";
import { FarmManagerAuthController } from "./auth.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";

const router = Router();

router.post("/login", FarmManagerAuthController.loginFarmManager);

router.post("/forgot-password", FarmManagerAuthController.forgotPassword);

router.post("/verify-otp", FarmManagerAuthController.verifyForgotPasswordOtp);

router.post(
  "/reset-password",
  checkAuthMiddleware(),
  FarmManagerAuthController.resetPassword,
);

router.post(
  "/change-password",
  checkAuthMiddleware(),
  FarmManagerAuthController.changePassword,
);

export const FarmManagerAuthRoutes = router;
