import { SubscriptionService } from "./subscription.service.js";

const getCurrentSubscription = async (req, res) => {
    try {
        const data = await SubscriptionService.getCurrentSubscription(req);

        return res.status(200).json({
            success: true,
            message: "Current subscription fetched successfully",
            data
        });
    } catch (error) {
        console.error("FarmAdmin | getCurrentSubscription error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch subscription"
        });
    }
};

const getAvailablePlans = async (req, res) => {
    try {
        const plans = await SubscriptionService.getAvailablePlans();

        return res.status(200).json({
            success: true,
            message: "Plans fetched successfully",
            data: plans
        });
    } catch (error) {
        console.error("FarmAdmin | getAvailablePlans error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch plans"
        });
    }
};

const getBillingHistory = async (req, res) => {
    try {
        const history = await SubscriptionService.getBillingHistory(req);

        return res.status(200).json({
            success: true,
            message: "Billing history fetched successfully",
            data: history
        });
    } catch (error) {
        console.error("FarmAdmin | getBillingHistory error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch billing history"
        });
    }
};

export const SubscriptionController = {
    getCurrentSubscription,
    getAvailablePlans,
    getBillingHistory
};
