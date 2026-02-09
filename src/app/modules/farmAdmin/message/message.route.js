import { Router } from "express";
import { MessageController } from "./message.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

// Oversight Endpoints
router.get(
  "/oversight/stats",
  checkAuthMiddleware(Role.FARM_ADMIN),
  MessageController.getOversightStats,
);

router.get(
  "/oversight/messages",
  checkAuthMiddleware(Role.FARM_ADMIN),
  MessageController.getOversightMessages,
);

router.get(
  "/oversight/inbox",
  checkAuthMiddleware(Role.FARM_ADMIN),
  MessageController.getOversightInbox,
);

router.patch(
  "/oversight/toggle",
  checkAuthMiddleware(Role.FARM_ADMIN),
  MessageController.toggleMessagingStatus,
);

router.delete(
  "/oversight/clear",
  checkAuthMiddleware(Role.FARM_ADMIN),
  MessageController.clearAllMessages,
);

router.delete(
  "/oversight/:messageId",
  checkAuthMiddleware(Role.FARM_ADMIN),
  MessageController.deleteMessage,
);

// Admin Inbox & History (Admins can message Managers)
router.get(
  "/inbox",
  checkAuthMiddleware(Role.FARM_ADMIN),
  MessageController.getInbox,
);

router.get(
  "/history/:partnerId",
  checkAuthMiddleware(Role.FARM_ADMIN),
  MessageController.getHistory,
);

router.post(
  "/",
  checkAuthMiddleware(Role.FARM_ADMIN),
  MessageController.sendMessage,
);

router.delete(
  "/history/:partnerId",
  checkAuthMiddleware(Role.FARM_ADMIN),
  MessageController.clearChatHistory,
);

export const FarmAdminMessageRoutes = router;
