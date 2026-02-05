import { Router } from "express";
import { SystemOwnerAuthController } from "./auth.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";

const router = Router();

router.post("/login", SystemOwnerAuthController.loginSystemOwner);

router.post("/forgot-password", SystemOwnerAuthController.forgotPassword);

router.post("/verify-otp", SystemOwnerAuthController.verifyForgotPasswordOtp);

router.post(
    "/reset-password",
    checkAuthMiddleware(),
    SystemOwnerAuthController.resetPassword
);

export const SystemOwnerAuthRoutes = router;
