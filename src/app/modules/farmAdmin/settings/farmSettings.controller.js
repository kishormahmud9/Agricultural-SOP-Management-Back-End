import { FarmSettingsService } from "./farmSettings.service.js";

const getFarmSettings = async (req, res) => {
    try {
        const data = await FarmSettingsService.getFarmSettings(req);

        return res.status(200).json({
            success: true,
            message: "Farm settings fetched successfully",
            data
        });
    } catch (error) {
        console.error("FarmAdmin | getFarmSettings error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch farm settings"
        });
    }
};

const updateFarmSettings = async (req, res) => {
    try {
        const data = await FarmSettingsService.updateFarmSettings(req);

        return res.status(200).json({
            success: true,
            message: "Farm settings updated successfully",
            data
        });
    } catch (error) {
        console.error("FarmAdmin | updateFarmSettings error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update farm settings"
        });
    }
};

export const FarmSettingsController = {
    getFarmSettings,
    updateFarmSettings
};
