import { Router } from "express";
import { downloadSOP, getSOPById, getSOPs } from "./sops.controller.js";

const router = Router();

router.get("/", getSOPs);

router.get("/:id/download", downloadSOP);

router.get("/:id", getSOPById);

export default router;
