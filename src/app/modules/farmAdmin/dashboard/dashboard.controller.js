import { DashboardService } from "./dashboard.service.js";

const getDashboard = async (req, res) => {
    try {
        const { name, role, farmId } = req.user;

        const dashboardData =
            await DashboardService.getDashboardStats(farmId);

        return res.status(200).json({
            success: true,
            data: {
                user: { name, role },
                ...dashboardData
            }
        });
    } catch (error) {
        console.error("Farm Admin Dashboard Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load dashboard data",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined
        });
    }
};

export const DashboardController = {
    getDashboard
};
