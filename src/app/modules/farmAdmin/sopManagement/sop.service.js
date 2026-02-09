import path from "path";
import fs from "fs";
import prisma from "../../../prisma/client.js";
import { AppError } from "../../../errorHelper/appError.js";
import { SOPAIService } from "./sop.ai.service.js";
import { sanitizeFileName } from "../../../utils/file.util.js";

const getAllSOPs = async (req) => {
  const { role, farmId } = req.user;
  const { category, search } = req.query;

  if (role !== "FARM_ADMIN") {
    throw new AppError("Access denied", 403);
  }

  if (!farmId) {
    throw new AppError("Farm context missing", 400);
  }

  const sops = await prisma.sOP.findMany({
    where: {
      farmId,
      isActive: true,
      ...(category && { category }),
      ...(search && {
        title: {
          contains: search,
          mode: "insensitive",
        },
      }),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      fileName: true,
      createdAt: true,
    },
  });

  return sops;
};

const deleteSOP = async (req) => {
  const { role, farmId } = req.user;
  const { id } = req.params;

  if (role !== "FARM_ADMIN") {
    throw new AppError("Access denied", 403);
  }

  if (!farmId) {
    throw new AppError("Farm context missing", 400);
  }

  await prisma.sOP.deleteMany({
    where: { id, farmId },
  });

  return {
    message: "SOP deleted successfully",
  };
};

const updateSOP = async (req) => {
  const { role, farmId } = req.user;
  const { id } = req.params;
  const { title, category } = req.body;

  if (role !== "FARM_ADMIN") {
    throw new AppError("Access denied", 403);
  }

  if (!farmId) {
    throw new AppError("Farm context missing", 400);
  }

  const result = await prisma.sOP.updateMany({
    where: {
      id,
      farmId,
      isActive: true,
    },
    data: {
      ...(title && { title }),
      ...(category && { category }),
    },
  });

  if (result.count === 0) {
    throw new AppError("SOP not found or access denied", 404);
  }

  return {
    message: "SOP updated successfully",
  };
};

const downloadSOP = async (req) => {
  const { role, farmId } = req.user;
  const { id } = req.params;

  const allowedRoles = ["FARM_ADMIN", "MANAGER", "EMPLOYEE"];

  if (!allowedRoles.includes(role)) {
    throw new AppError("Access denied", 403);
  }

  if (!farmId) {
    throw new AppError("Farm context missing", 400);
  }

  const sop = await prisma.sOP.findFirst({
    where: {
      id,
      farmId,
      isActive: true,
    },
  });

  if (!sop) {
    throw new AppError("SOP not found", 404);
  }

  return sop;
};

const uploadSOP = async (req) => {
  const { role, farmId } = req.user;
  const { title, category } = req.body;

  if (role !== "FARM_ADMIN") {
    throw new AppError("Access denied", 403);
  }

  if (!farmId) {
    throw new AppError("Farm context missing", 400);
  }

  if (!req.file) {
    throw new AppError("SOP file is required", 400);
  }

  if (!title || !category) {
    throw new AppError("Title and category are required", 400);
  }

  // 1️⃣ Save SOP FIRST (always)
  const sop = await prisma.sOP.create({
    data: {
      title,
      category,
      fileUrl: `/uploads/sops/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      farmId,
    },
  });

  // 2️⃣ Call AI (safe)
  const aiResult = await SOPAIService.extractSOPFromAI(req.file.path);

  // 3️⃣ Update SOP with AI data (if success)
  if (aiResult) {
    await prisma.sOP.update({
      where: { id: sop.id },
      data: {
        parsedContent: aiResult,
        language: aiResult.language || null,
      },
    });
  }

  return {
    message: "SOP uploaded successfully",
    sopId: sop.id,
    aiProcessed: Boolean(aiResult),
  };
};

const createDigitalSOP = async (req) => {
  const { role, farmId } = req.user;
  const { title, category, content } = req.body;

  if (role !== "FARM_ADMIN") {
    throw new AppError("Access denied", 403);
  }

  if (!farmId) {
    throw new AppError("Farm context missing", 400);
  }

  if (!title || !category) {
    throw new AppError("Title and category are required", 400);
  }

  if (!content || typeof content !== "object") {
    throw new AppError("SOP content is required", 400);
  }

  const sop = await prisma.sOP.create({
    data: {
      title,
      category,
      source: "DIGITAL_EDITOR",
      parsedContent: content,
      farmId,
    },
  });

  return sop;
};

const uploadPDFSOP = async (req) => {
  const { title, category } = req.body;
  const file = req.file;

  if (!file) {
    throw new AppError("PDF file is required", 400);
  }

  if (!title || !category) {
    throw new AppError("Title and category are required", 400);
  }

  const farmId = req.user?.farmId;

  if (!farmId) {
    throw new AppError("Farm context missing", 403);
  }

  // multer already saved the file correctly
  const relativeFilePath = path.join(
    "uploads",
    "sops",
    path.basename(file.path)
  );

  const sop = await prisma.sOP.create({
    data: {
      title,
      category,
      source: "PDF_UPLOAD",
      fileUrl: relativeFilePath,
      fileName: file.originalname,
      fileType: "pdf",
      parsedContent: null,
      farmId,
    },
  });

  return sop;
};

export const SOPService = {
  getAllSOPs,
  deleteSOP,
  downloadSOP,
  updateSOP,
  uploadSOP,
  createDigitalSOP,
  uploadPDFSOP,
};
