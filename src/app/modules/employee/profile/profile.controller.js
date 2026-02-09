import { ProfileService } from "./profile.service.js";

const getProfile = async (req, res) => {
  try {
    const { id: employeeId } = req.user;

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

    return res.status(400).json({
      success: false,
      message: "Failed to load profile",
      data: null,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { id: employeeId } = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    await ProfileService.changePassword(employeeId, oldPassword, newPassword);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("CHANGE_PASSWORD_ERROR:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id: employeeId } = req.user;
    const { name } = req.body;
    let avatarData = {};

    if (req.file) {
      avatarData = {
        avatarUrl: `${req.protocol}://${req.get("host")}/uploads/profiles/${req.file.filename}`,
        avatarUrlPath: req.file.path,
      };
    }

    const result = await ProfileService.updateProfile(employeeId, {
      name,
      ...avatarData,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("UPDATE_PROFILE_ERROR:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const ProfileController = {
  getProfile,
  changePassword,
  updateProfile,
};
