import { Router } from "express";
import { MessageController } from "./message.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get("/", checkAuthMiddleware(Role.EMPLOYEE), MessageController.getInbox);

// 👇 NEW (open chat screen)
router.get(
  "/conversation/:otherUserId",
  checkAuthMiddleware(Role.EMPLOYEE),
  MessageController.getConversation,
);

export default router;
