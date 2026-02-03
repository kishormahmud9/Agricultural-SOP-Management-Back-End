import { ProfileService } from "./profile.service.js";

// TEMP: replace with req.user.id later
const MANAGER_ID = "8a925b2b-ead9-47c0-bd96-069d5d2fc496"; // 👈 use real manager id

const getProfile = async (req, res) => {
  try {
    const profile = await ProfileService.getProfile(MANAGER_ID);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("GET_PROFILE_ERROR:", error.message);

    // ✅ Known / expected errors → 400 or 404
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;

    const result = await ProfileService.updateLanguage(MANAGER_ID, language);

    return res.status(200).json({
      success: true,
      message: "Language updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("UPDATE_LANGUAGE_ERROR:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const ProfileController = {
  getProfile,
  updateLanguage,
};
