import prisma from "../../../prisma/client.js";
import fs from "fs";
import path from "path";

// SOP Modules list
const getSopModules = async (farmId) => {
  const grouped = await prisma.sOP.groupBy({
    by: ["category"],
    where: {
      farmId,
      isActive: true,
    },
    _count: {
      _all: true,
    },
    orderBy: {
      category: "asc",
    },
  });

  return grouped.map((item) => ({
    module: item.category,
    count: item._count._all,
  }));
};

// SOP list inside a module
const getSopsByModule = async (farmId, module) => {
  const validCategories = [
    "MILKING",
    "FEEDING",
    "HEALTH",
    "CALVES",
    "MAINTENANCE",
    "EMERGENCIES",
  ];
  const categoryFilter = module.toUpperCase();

  if (!validCategories.includes(categoryFilter)) {
    return []; // Return empty list instead of crashing if category is invalid
  }

  const sops = await prisma.sOP.findMany({
    where: {
      farmId,
      category: categoryFilter,
      isActive: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      fileUrl: true,
      updatedAt: true,
    },
  });
  return sops;
};

const getSopFile = async (sopId) => {
  const sop = await prisma.sOP.findUnique({
    where: { id: sopId },
    select: {
      fileUrl: true,
      title: true,
    },
  });

  if (!sop) {
    throw new Error("SOP not found");
  }

  const filePath = path.resolve(sop.fileUrl);

  return {
    fileName: `${sop.title}.pdf`,
    stream: fs.createReadStream(filePath),
  };
};

const viewSop = async (sopId) => {
  const sop = await prisma.sOP.findUnique({
    where: { id: sopId },
    select: {
      id: true,
      title: true,
      category: true,
      parsedContent: true,
      language: true,
      updatedAt: true,
    },
  });

  if (!sop) {
    throw new Error("SOP not found");
  }

  return {
    id: sop.id,
    title: sop.title,
    module: sop.category,
    language: sop.language || "en",
    updatedAt: sop.updatedAt,
    isOfflineAvailable: true, // frontend logic can override
    content: sop.parsedContent, // 👈 THIS POWERS THE PAGE
  };
};

export const SopService = {
  getSopModules,
  getSopsByModule,
  getSopFile,
  viewSop,
};
