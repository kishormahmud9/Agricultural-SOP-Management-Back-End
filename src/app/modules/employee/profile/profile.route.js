import { Router } from "express";
import { ProfileController } from "./profile.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import { createMulterUpload } from "../../../config/multer.config.js";

const router = Router();
const upload = createMulterUpload("profiles");

router.get(
  "/",
  checkAuthMiddleware(Role.EMPLOYEE),
  ProfileController.getProfile,
);

router.patch(
  "/change-password",
  checkAuthMiddleware(Role.EMPLOYEE),
  ProfileController.changePassword,
);

router.patch(
  "/update",
  checkAuthMiddleware(Role.EMPLOYEE),
  upload.single("avatar"),
  ProfileController.updateProfile,
);

export default router;
