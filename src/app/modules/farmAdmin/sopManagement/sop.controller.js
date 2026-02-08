import { SOPService } from "./sop.service.js";
import path from "path";
import fs from "fs";

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
      const fileUrl = await SOPService.downloadSOP(req);

      if (!fileUrl) {
        return res.status(404).json({
          success: false,
          message: "SOP file not found",
        });
      }

      // If the stored URL is already an absolute HTTP(S) URL, redirect directly
      if (/^https?:\/\//i.test(fileUrl)) {
        return res.redirect(fileUrl);
      }

      // Normalize local paths and prefer sending the file if it exists on disk
      const possibleLocalPath = path.isAbsolute(fileUrl)
        ? fileUrl
        : path.join(process.cwd(), fileUrl);

      if (fs.existsSync(possibleLocalPath)) {
        return res.sendFile(possibleLocalPath);
      }

      // Otherwise, try redirecting to the public uploads route (app serves /uploads)
      const publicPath = fileUrl.replace(/^\\+|^\/+/, "");
      return res.redirect(`/${publicPath}`);
    } catch (error) {
      next(error);
    }
  }
}
