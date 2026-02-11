import express from "express";
import { ProxyController } from "./proxy.controller.js";

const router = express.Router();

// Proxy all /static/* requests to AI service
router.get("/static/*", ProxyController.proxyStaticFile);

export default router;
