import { SOPService } from "./sop.service.js";
import path from "path";
import fs from "fs";
import { AppError } from "../../../errorHelper/appError.js";
import { sanitizeFileName } from "../../../utils/file.util.js";
import { generateSOPPdf } from "./sop.pdf.util.js";

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

  static async getSOPById(req, res, next) {
    try {
      const sop = await SOPService.getSOPById(req);
      res.status(200).json({
        success: true,
        data: sop,
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

      if (!sop) {
        throw new AppError("SOP not found", 404);
      }

      // ── Case 1: SOP has a physical file → stream it ──
      if (sop.fileUrl) {
        const relativePath = sop.fileUrl.replace(/^\/+/, "");
        const filePath = path.resolve(process.cwd(), relativePath);

        if (!fs.existsSync(filePath)) {
          throw new AppError("File missing on server", 404);
        }

        let ext = path.extname(filePath).toLowerCase();
        if (!ext && sop.fileType) {
          ext = sop.fileType.startsWith(".")
            ? sop.fileType.toLowerCase()
            : `.${sop.fileType.toLowerCase()}`;
        }

        // Default to .pdf if extension is still missing (common for digital SOPs)
        if (!ext) {
          ext = ".pdf";
        }

        let safeFileName = sanitizeFileName(
          sop.fileName || path.basename(filePath),
        );

        // Ensure the filename ends with the correct extension
        if (!safeFileName.toLowerCase().endsWith(ext)) {
          safeFileName += ext;
        }

        const mimeTypes = {
          ".pdf": "application/pdf",
          ".docx":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ".doc": "application/msword",
        };

        res.setHeader(
          "Content-Type",
          mimeTypes[ext] || "application/octet-stream",
        );
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
        return;
      }

      // ── Case 2: Content-only SOP → generate PDF on-the-fly ──
      if (sop.parsedContent) {
        const safeFileName = sanitizeFileName(sop.title || "SOP") + ".pdf";

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${safeFileName}"`,
        );

        const pdfStream = generateSOPPdf(sop);

        pdfStream.on("error", (err) => {
          console.error("❌ PDF generation error:", err.message);
          if (!res.headersSent) {
            next(err);
          }
        });

        pdfStream.pipe(res);
        return;
      }

      // ── No file and no content ──
      throw new AppError(
        "This SOP has no downloadable file or content",
        404,
      );
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
}
