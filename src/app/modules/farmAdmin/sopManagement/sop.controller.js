import { SOPService } from "./sop.service.js";
import path from "path";
import fs from "fs";
import { AppError } from "../../../errorHelper/appError.js";
import { sanitizeFileName } from "../../../utils/file.util.js";

export class SOPController {
  static async getAllSOPs(req, res, next) {
    try {
      const sops = await SOPService.getAllSOPs(req);
      res.status(200).json({
        success: true,
        data: sops,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSOP(req, res, next) {
    try {
      const result = await SOPService.deleteSOP(req);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSOP(req, res, next) {
    try {
      const sop = await SOPService.updateSOP(req);
      res.status(200).json({
        success: true,
        data: sop,
      });
    } catch (error) {
      next(error);
    }
  }

  static async downloadSOP(req, res, next) {
    try {
      const sop = await SOPService.downloadSOP(req);

      if (!sop || !sop.fileUrl) {
        throw new AppError("File not found", 404);
      }

      const relativePath = sop.fileUrl.replace(/^\/+/, "");
      const filePath = path.resolve(process.cwd(), relativePath);

      if (!fs.existsSync(filePath)) {
        throw new AppError("File missing on server", 404);
      }

      const safeFileName = sanitizeFileName(
        sop.fileName || path.basename(filePath),
      );

      // ✅ Correct MIME type for DOCX
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );

      // ✅ SAFE Content-Disposition with quotes for filenames with spaces
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${safeFileName}"`,
      );

      const fileStream = fs.createReadStream(filePath);

      fileStream.on("error", (err) => {
        console.error("❌ Stream error:", err.message);
        if (!res.headersSent) {
          next(err);
        }
      });

      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  static async uploadSOP(req, res, next) {
    try {
      const result = await SOPService.uploadSOP(req);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createDigitalSOP(req, res, next) {
    try {
      const sop = await SOPService.createDigitalSOP(req);
      res.status(201).json({
        success: true,
        message: "Digital SOP created successfully",
        data: sop,
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadPDFSOP(req, res, next) {
    try {
      const sop = await SOPService.uploadPDFSOP(req);
      res.status(201).json({
        success: true,
        message: "SOP PDF uploaded successfully",
        data: sop,
      });
    } catch (error) {
      next(error);
    }
  }

  static async downloadSOP(req, res, next) {
    try {
      const sop = await SOPService.downloadSOP(req);

      if (!sop || !sop.fileUrl) {
        throw new AppError("File not found", 404);
      }

      const filePath = path.join(process.cwd(), sop.fileUrl);

      if (!fs.existsSync(filePath)) {
        throw new AppError("File missing on server", 404);
      }

      const mimeMap = {
        pdf: "application/pdf",
        docx:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };

      res.setHeader(
        "Content-Type",
        mimeMap[sop.fileType] || "application/octet-stream"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${sop.fileName}"`
      );

      fs.createReadStream(filePath).pipe(res);
    } catch (error) {
      next(error);
    }
  }

}
