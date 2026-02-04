import prisma from "../../../prisma/client.js";
import fs from "fs";
import path from "path";

// SOP Modules list
const getSopModules = async (farmId) => {
  const grouped = await prisma.sOP.groupBy({
    by: ["module"],
    where: {
      farmId,
      isActive: true,
    },
    _count: {
      _all: true,
    },
    orderBy: {
      module: "asc",
    },
  });

  return grouped.map((item) => ({
    module: item.module,
    count: item._count._all,
  }));
};

// SOP list inside a module
const getSopsByModule = async (farmId, module) => {
  return prisma.sOP.findMany({
    where: {
      farmId,
      module,
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
      module: true,
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
    module: sop.module,
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
