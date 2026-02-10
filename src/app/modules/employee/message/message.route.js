import { Router } from "express";
import { MessageController } from "./message.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import { createMulterUpload } from "../../../config/multer.config.js";

const router = Router();

router.get("/", checkAuthMiddleware(Role.EMPLOYEE), MessageController.getInbox);
router.get(
  "/contacts",
  checkAuthMiddleware(Role.EMPLOYEE),
  MessageController.getContacts,
);

// 👇 NEW (open chat screen)
router.get(
  "/conversation/:otherUserId",
  checkAuthMiddleware(Role.EMPLOYEE),
  MessageController.getConversation,
);

router.post(
  "/send",
  checkAuthMiddleware(Role.EMPLOYEE),
  createMulterUpload("messages").single("image"),
  MessageController.sendMessage,
);

export default router;
