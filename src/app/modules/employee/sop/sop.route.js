import { Router } from "express";
import { SopController } from "./sop.controller.js";

const router = Router();

router.get("/", SopController.getSopModules);

// 👇 SOP TEXT VIEW PAGE (THIS PAGE)
router.get("/:sopId/view", SopController.viewSop);

// 👇 SOP PDF DOWNLOAD
router.get("/:sopId/download", SopController.downloadSop);

// 👇 SOP LIST BY MODULE (KEEP LAST)
router.get("/:module", SopController.getSopsByModule);

export default router;
