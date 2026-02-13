import { Router } from "express";
import { FarmAdminAuthController } from "./auth.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";

const router = Router();

router.post("/login", FarmAdminAuthController.loginFarmAdmin);

router.post("/forgot-password", FarmAdminAuthController.forgotPassword);

router.post("/verify-otp", FarmAdminAuthController.verifyForgotPasswordOtp);

router.post(
  "/reset-password",
  checkAuthMiddleware(),
  FarmAdminAuthController.resetPassword,
);

router.post(
  "/change-password",
  checkAuthMiddleware(),
  FarmAdminAuthController.changePassword,
);

export const FarmAdminAuthRoutes = router;
