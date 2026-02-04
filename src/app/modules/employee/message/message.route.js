import { Router } from "express";
import { MessageController } from "./message.controller.js";

const router = Router();

router.get("/", MessageController.getInbox);

// 👇 NEW (open chat screen)
router.get("/conversation/:otherUserId", MessageController.getConversation);

export default router;
