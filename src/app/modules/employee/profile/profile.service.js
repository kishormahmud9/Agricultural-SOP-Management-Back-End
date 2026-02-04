import prisma from "../../../prisma/client.js";

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

export const ProfileService = {
  getProfile,
};
