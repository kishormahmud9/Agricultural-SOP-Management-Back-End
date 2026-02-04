import { ProfileService } from "./profile.service.js";

const getProfile = async (req, res) => {
  try {
    const { employeeId } = req.query;

    if (!employeeId) {
      return res.status(200).json({
        success: false,
        message: "employeeId is required (dev mode)",
        data: null,
      });
    }

    const profile = await ProfileService.getProfile(employeeId);

    if (!profile) {
      return res.status(200).json({
        success: false,
        message: "Employee not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("GET_PROFILE_ERROR:", error.message);

    return res.status(200).json({
      success: false,
      message: "Failed to load profile",
      data: null,
    });
  }
};

export const ProfileController = {
  getProfile,
};
