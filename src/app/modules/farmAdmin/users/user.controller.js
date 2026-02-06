import { UserService } from "./user.service.js";

const getUsers = async (req, res) => {
    try {
        const { farmId } = req.user;
        const { search = "" } = req.query;

        const data = await UserService.getUsers(farmId, search);

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("User list error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load users"
        });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { farmId } = req.user;
        const { id } = req.params;
        const { status } = req.body;

        await UserService.updateUserStatus(farmId, id, status);

        return res.json({
            success: true,
            message: "User status updated"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { farmId } = req.user;
        const { id } = req.params;
        const payload = req.body;

        await UserService.updateUser(farmId, id, payload);

        return res.json({
            success: true,
            message: "User updated successfully"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { farmId } = req.user;
        const { id } = req.params;

        await UserService.deleteUser(farmId, id);

        return res.json({
            success: true,
            message: "User deleted"
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const createUser = async (req, res) => {
    try {
        const { farmId } = req.user;
        const payload = req.body;

        const user = await UserService.createUser(farmId, payload);

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const UserController = {
    getUsers,
    updateUserStatus,
    updateUser,
    deleteUser,
    createUser
};
