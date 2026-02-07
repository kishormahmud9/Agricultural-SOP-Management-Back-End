import prisma from "../../../prisma/client.js";

const getFarmSettings = async (req) => {
    const { role, farmId } = req.user;

    if (role !== "FARM_ADMIN") {
        throw new Error("Access denied");
    }

    if (!farmId) {
        throw new Error("Farm context missing");
    }

    const farm = await prisma.farm.findUnique({
        where: { id: farmId },
        select: {
            id: true,
            name: true,
            country: true,
            defaultLanguage: true,
            status: true
        }
    });

    if (!farm) {
        throw new Error("Farm not found");
    }

    return farm;
};

const updateFarmSettings = async (req) => {
    const { role, farmId } = req.user;
    const { name } = req.body;

    if (role !== "FARM_ADMIN") {
        throw new Error("Access denied");
    }

    if (!farmId) {
        throw new Error("Farm context missing");
    }

    if (!name || name.trim().length < 3) {
        throw new Error("Farm name must be at least 3 characters long");
    }

    const updatedFarm = await prisma.farm.update({
        where: { id: farmId },
        data: {
            name: name.trim()
        },
        select: {
            id: true,
            name: true,
            country: true,
            defaultLanguage: true,
            status: true
        }
    });

    return updatedFarm;
};

export const FarmSettingsService = {
    getFarmSettings,
    updateFarmSettings
};
