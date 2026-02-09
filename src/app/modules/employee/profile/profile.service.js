import prisma from "../../../prisma/client.js";
import bcrypt from "bcrypt";

const getProfile = async (employeeId) => {
  try {
    return await prisma.user.findUnique({
      where: {
        id: employeeId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        jobTitle: true,
        avatarUrl: true,
        language: true,
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("PROFILE_SERVICE_ERROR:", error.message);
    return null;
  }
};

const changePassword = async (employeeId, oldPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: employeeId },
  });

  if (!user) {
    throw new Error("Employee not found");
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Invalid old password");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: employeeId },
    data: { passwordHash },
  });

  return true;
};

const updateProfile = async (employeeId, data) => {
  const { name, avatarUrl, avatarUrlPath } = data;

  const updateData = {};
  if (name) updateData.name = name;
  if (avatarUrl) updateData.avatarUrl = avatarUrl;
  if (avatarUrlPath) updateData.avatarUrlPath = avatarUrlPath;

  if (Object.keys(updateData).length === 0) {
    throw new Error("No data provided for update");
  }

  const updated = await prisma.user.update({
    where: { id: employeeId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      jobTitle: true,
      language: true,
      farm: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return updated;
};

export const ProfileService = {
  getProfile,
  changePassword,
  updateProfile,
};
