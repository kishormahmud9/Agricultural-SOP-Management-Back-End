import { Router } from "express";
import { MessageController } from "./message.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get("/conversations", checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER), MessageController.getConversations);

router.get("/history", checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER), MessageController.getChatHistory);

export default router;
