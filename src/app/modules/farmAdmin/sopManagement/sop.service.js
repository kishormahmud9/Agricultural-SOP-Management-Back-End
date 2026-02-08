import prisma from "../../../prisma/client.js";

const getAllSOPs = async (req) => {
  const { role, farmId } = req.user;
  const { category, search } = req.query;

  if (role !== "FARM_ADMIN") {
    throw new Error("Access denied");
  }

  if (!farmId) {
    throw new Error("Farm context missing");
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
    throw new Error("Access denied");
  }

  if (!farmId) {
    throw new Error("Farm context missing");
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
    throw new Error("Access denied");
  }

  if (!farmId) {
    throw new Error("Farm context missing");
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
    throw new Error("SOP not found or access denied");
  }

  return {
    message: "SOP updated successfully",
  };
};

const downloadSOP = async (req) => {
  const { role, farmId } = req.user;
  const { id } = req.params;

  if (role !== "FARM_ADMIN") {
    throw new Error("Access denied");
  }

  if (!farmId) {
    throw new Error("Farm context missing");
  }

  const sop = await prisma.sOP.findFirst({
    where: { id, farmId, isActive: true },
  });

  if (!sop) {
    throw new Error("SOP not found");
  }

  return sop.fileUrl;
};

export const SOPService = {
  getAllSOPs,
  deleteSOP,
  downloadSOP,
  updateSOP,
};
