import { Router } from "express";
import { ProfileController } from "./profile.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get("/", checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER), ProfileController.getProfile);

router.patch("/language", checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER), ProfileController.updateLanguage);


export default router;
