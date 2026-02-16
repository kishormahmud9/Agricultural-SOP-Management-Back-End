import express from "express";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import { SOPController } from "./sop.controller.js";
import { createMulterUpload } from "../../../config/multer.config.js";

const router = express.Router();
const uploadSOPMiddleware = createMulterUpload("sops");

// This is for AI extraction 
// router.post(
//   "/upload",
//   checkAuthMiddleware(Role.FARM_ADMIN),
//   uploadSOPMiddleware.single("file"),
//   SOPController.uploadSOP,
// );

router.post(
  "/create",
  checkAuthMiddleware(Role.FARM_ADMIN),
  uploadSOPMiddleware.single("file"),
  SOPController.createDigitalSOP,
);

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

router.post(
  "/upload-pdf",
  checkAuthMiddleware(Role.FARM_ADMIN),
  uploadSOPMiddleware.single("file"),
  SOPController.uploadPDFSOP,
);

router.get("/", checkAuthMiddleware(Role.FARM_ADMIN), SOPController.getAllSOPs);

router.get("/:id", checkAuthMiddleware(Role.FARM_ADMIN), SOPController.getSOPById);

export default router;
