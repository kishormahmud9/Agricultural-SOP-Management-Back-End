import prisma from "../../../prisma/client.js";

export const getAll = async ({ farmId, module, search }) => {
  try {
    const sops = await prisma.sOP.findMany({
      where: {
        ...(farmId && { farmId }),
        ...(module && { module }),
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
        module: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return sops.map((sop) => ({
      id: sop.id,
      title: sop.title,
      module: sop.module,
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
        module: true,
        fileUrl: true,
        parsedContent: true,
        createdAt: true,
      },
    });

    if (!sop) return null;

    return {
      id: sop.id,
      title: sop.title,
      module: sop.module,
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
