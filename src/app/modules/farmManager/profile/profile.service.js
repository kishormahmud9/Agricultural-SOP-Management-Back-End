import prisma from "../../../prisma/client.js";

const getProfile = async (managerId) => {
  const user = await prisma.user.findUnique({
    where: { id: managerId },
    include: {
      farm: {
        select: { name: true, defaultLanguage: true },
      },
    },
  });

  if (!user) {
    throw new Error("Manager not found");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    farmName: user.farm?.name ?? "—",
    language: user.language ?? "English",
  };
};

const updateLanguage = async (managerId, language) => {
  if (!language || typeof language !== "string") {
    throw new Error("Language is required");
  }

  const updated = await prisma.user.update({
    where: { id: managerId },
    data: { language },
    include: {
      farm: {
        select: { name: true, defaultLanguage: true },
      },
    },
  });

  if (!updated) {
    throw new Error("Manager not found");
  }

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    farmName: updated.farm?.name ?? "—",
    language: updated.language ?? "English",
  };
};

const updateProfile = async (managerId, data) => {
  const { name, avatarUrl, avatarUrlPath } = data;

  const updateData = {};
  if (name) updateData.name = name;
  if (avatarUrl) updateData.avatarUrl = avatarUrl;
  if (avatarUrlPath) updateData.avatarUrlPath = avatarUrlPath;

  if (Object.keys(updateData).length === 0) {
    throw new Error("No data provided for update");
  }

  const updated = await prisma.user.update({
    where: { id: managerId },
    data: updateData,
    include: {
      farm: {
        select: { name: true, defaultLanguage: true },
      },
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    avatarUrl: updated.avatarUrl,
    farmName: updated.farm?.name ?? "—",
    language: updated.language ?? "English",
  };
};

export const ProfileService = {
  getProfile,
  updateLanguage,
  updateProfile,
};
