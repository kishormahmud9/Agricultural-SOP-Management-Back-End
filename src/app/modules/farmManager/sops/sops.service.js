import prisma from "../../../prisma/client.js";

export const getAll = async ({ farmId, module, search }) => {
  try {
    const validCategories = ["SAFETY", "OPERATIONS", "COMPLIANCE", "TRAINING"];
    const categoryFilter = module ? module.toUpperCase() : null;

    const sops = await prisma.sOP.findMany({
      where: {
        ...(farmId && { farmId }),
        ...(categoryFilter && validCategories.includes(categoryFilter) && { category: categoryFilter }),
        ...(search && {
          title: {
            contains: search,
            mode: "insensitive",
          },
        }),
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        category: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return sops.map((sop) => ({
      id: sop.id,
      title: sop.title,
      module: sop.category,
      date: sop.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));
  } catch (error) {
    console.error("🔥 SOP SERVICE ERROR:", error);
    throw error;
  }
};

export const getById = async ({ id, farmId }) => {
  try {
    const sop = await prisma.sOP.findFirst({
      where: {
        id,
        farmId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        category: true,
        fileUrl: true,
        parsedContent: true,
        createdAt: true,
      },
    });

    if (!sop) return null;

    return {
      id: sop.id,
      title: sop.title,
      module: sop.category,
      uploadedAt: sop.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      uploadedBy: "Admin", // static for now
      fileUrl: sop.fileUrl,
      procedure: {
        objective: sop.parsedContent?.objective || "",
        scope: sop.parsedContent?.scope || "",
        steps: sop.parsedContent?.steps || [],
        importantNote: sop.parsedContent?.importantNote || "",
      },
    };
  } catch (error) {
    console.error("SOP DETAILS SERVICE ERROR:", error);
    throw error;
  }
};

export const getDownloadUrl = async ({ id, farmId }) => {
  try {
    const sop = await prisma.sOP.findFirst({
      where: {
        id,
        farmId,
        isActive: true,
      },
      select: {
        fileUrl: true,
      },
    });

    return sop?.fileUrl || null;
  } catch (error) {
    console.error("SOP DOWNLOAD SERVICE ERROR:", error);
    throw error;
  }
};

export const getReadFile = async ({ id, farmId }) => {
  try {
    const sop = await prisma.sOP.findFirst({
      where: {
        id,
        farmId,
        isActive: true,
      },
      select: {
        fileUrl: true,
        fileName: true,
        fileType: true,
      },
    });

    return sop || null;
  } catch (error) {
    console.error("SOP READ SERVICE ERROR:", error);
    throw error;
  }
};