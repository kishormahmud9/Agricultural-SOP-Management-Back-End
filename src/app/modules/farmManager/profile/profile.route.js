import { Router } from "express";
import { ProfileController } from "./profile.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

import { createMulterUpload } from "../../../config/multer.config.js";

const router = Router();
const upload = createMulterUpload("profiles");

router.get("/", checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER), ProfileController.getProfile);

router.patch("/language", checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER), ProfileController.updateLanguage);

router.patch(
    "/update",
    checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER),
    upload.single("avatar"),
    ProfileController.updateProfile
);

export default router;
