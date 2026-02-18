import { SOPService } from "./sops.service.js";
import path from "path";
import fs from "fs";

const getSopModules = async (req, res, next) => {
  try {
    const { farmId } = req.user;

    const result = await SOPService.getSopModules(farmId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getSopsByModule = async (req, res, next) => {
  try {
    const { farmId } = req.user;
    const { module } = req.params;

    if (!module) {
      return res.status(400).json({
        success: false,
        message: "module is required",
      });
    }

    const result = await SOPService.getSopsByModule(farmId, module);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


const downloadSop = async (req, res, next) => {
  try {
    const { sopId } = req.params;

    const result = await SOPService.getSopFile(sopId);

    // Tell browser/mobile app to download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`,
    );

    res.setHeader("Content-Type", "application/pdf");

    result.stream.pipe(res);
  } catch (error) {
    if (error.message === "SOP not found" || error.message === "SOP file not found in database") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

const getSOPDetail = async (req, res, next) => {
  try {
    const { sopId } = req.params;
    const { type } = req.query; // 'read' for PDF, otherwise JSON

    if (type === "read") {
      const sop = await SOPService.getReadFile({
        id: sopId,
        farmId: req.user.farmId,
      });

      if (!sop || !sop.fileUrl) {
        return res.status(404).json({
          success: false,
          message: "SOP file not found",
        });
      }

      // Only allow inline reading for PDFs
      if (sop.fileType !== "pdf") {
        return res.status(400).json({
          success: false,
          message: "Only PDF files can be read online",
        });
      }

      // Remote file (S3 / CDN)
      if (/^https?:\/\//i.test(sop.fileUrl)) {
        return res.redirect(sop.fileUrl);
      }

      // Local file
      const localPath = path.isAbsolute(sop.fileUrl)
        ? sop.fileUrl
        : path.join(process.cwd(), sop.fileUrl);

      if (!fs.existsSync(localPath)) {
        return res.status(404).json({
          success: false,
          message: "File missing on server",
        });
      }

      const contentType =
        sop.fileType === "pdf" ? "application/pdf" : "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${sop.fileName || "sop.pdf"}"`,
      );

      return fs.createReadStream(localPath).pipe(res);
    }

    // Default: Return JSON view data
    const sop = await SOPService.viewSop(sopId);

    res.status(200).json({
      success: true,
      data: sop,
    });
  } catch (error) {
    next(error);
  }
};

export const SOPController = {
  getSopModules,
  getSopsByModule,
  getSOPDetail,
  downloadSop,
};
