import express from "express";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import { SOPController } from "./sop.controller.js";

const router = express.Router();

router.get(
  "/:id/download",
  checkAuthMiddleware(Role.FARM_ADMIN),
  SOPController.downloadSOP,
);

router.delete(
  "/:id",
  checkAuthMiddleware(Role.FARM_ADMIN),
  SOPController.deleteSOP,
);

router.patch(
  "/:id",
  checkAuthMiddleware(Role.FARM_ADMIN),
  SOPController.updateSOP,
);

router.get("/", checkAuthMiddleware(Role.FARM_ADMIN), SOPController.getAllSOPs);

export default router;
