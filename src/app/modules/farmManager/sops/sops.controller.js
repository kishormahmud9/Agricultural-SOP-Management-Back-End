import * as SOPService from "./sops.service.js";
import path from "path";
import fs from "fs";

export const getSOPs = async (req, res) => {
  try {
    const { module, search } = req.query;

    const sops = await SOPService.getAll({
      farmId: req.user.farmId,
      module,
      search,
    });

    return res.json({
      success: true,
      data: sops,
    });
  } catch (error) {
    console.error("GET SOPs ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load SOPs",
    });
  }
};

export const getSOPById = async (req, res) => {
  try {
    const { id } = req.params;

    const sop = await SOPService.getById({ id, farmId: req.user.farmId });

    if (!sop) {
      return res.status(404).json({
        success: false,
        message: "SOP not found",
      });
    }

    return res.json({
      success: true,
      data: sop,
    });
  } catch (error) {
    console.error("GET SOP DETAILS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load SOP details",
    });
  }
};

export const downloadSOP = async (req, res) => {
  try {
    const { id } = req.params;

    const fileUrl = await SOPService.getDownloadUrl({ id, farmId: req.user.farmId });

    if (!fileUrl) {
      return res.status(404).json({
        success: false,
        message: "SOP file URL not found in database",
      });
    }

    // If the stored URL is already an absolute HTTP(S) URL, redirect directly
    if (/^https?:\/\//i.test(fileUrl)) {
      return res.redirect(fileUrl);
    }

    // Normalize local paths
    const publicPath = fileUrl.replace(/^\\+|^\/+/, "");
    const fullLocalPath = path.join(process.cwd(), publicPath);

    if (fs.existsSync(fullLocalPath)) {
      return res.download(fullLocalPath);
    }

    // Fallback: just return 404 if file is missing on disk
    return res.status(404).json({
      success: false,
      message: "SOP file not found on server",
    });
  } catch (error) {
    console.error("DOWNLOAD SOP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to download SOP",
    });
  }
};

export const readSOP = async (req, res) => {
  try {
    const { id } = req.params;

    const sop = await SOPService.getReadFile({
      id,
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


    const contentType = sop.fileType === "pdf" ? "application/pdf" : "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${sop.fileName || "sop.pdf"}"`
    );

    fs.createReadStream(localPath).pipe(res);
  } catch (error) {
    console.error("READ SOP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to read SOP",
    });
  }
};
