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
    console.error("DOWNLOAD SOP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to download SOP",
    });
  }
};
