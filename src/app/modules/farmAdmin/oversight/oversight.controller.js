import { OversightService } from "./oversight.service.js";

const getTasks = async (req, res) => {
    try {
        const result = await OversightService.getTasks(req);

        return res.status(200).json({
            success: true,
            message: "Tasks fetched successfully",
            data: result
        });
    } catch (error) {
        console.error("FarmAdmin | getTasks error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch tasks"
        });
    }
};

const getTaskStats = async (req, res) => {
    try {
        const stats = await OversightService.getTaskStats(req);

        return res.status(200).json({
            success: true,
            message: "Task stats fetched successfully",
            data: stats
        });
    } catch (error) {
        console.error("FarmAdmin | getTaskStats error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch task stats"
        });
    }
};

export const OversightController = {
    getTasks,
    getTaskStats
};
