import { Router } from "express";
import { MessageController } from "./message.controller.js";

const router = Router();

router.get("/conversations", MessageController.getConversations);

router.get("/history", MessageController.getChatHistory);

export default router;
