import { Router } from "express";
import { MessageController } from "./message.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import { createMulterUpload } from "../../../config/multer.config.js";

const router = Router();

router.get(
  "/",
  checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER),
  MessageController.getInbox,
);

router.get(
  "/contacts",
  checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER),
  MessageController.getContacts,
);

router.get(
  "/history/:partnerId",
  checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER),
  MessageController.getChatHistory,
);

router.post(
  "/",
  checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER),
  createMulterUpload("messages").single("image"),
  MessageController.sendMessage,
);

export default router;
