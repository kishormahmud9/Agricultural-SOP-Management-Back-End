import prisma from "../src/app/prisma/client.js";
import { SystemAdminService } from "../src/app/modules/systemOwner/admin/admin.service.js";
import { FarmAdminService } from "../src/app/modules/farmAdmin/farmAdmin.service.js";
import { ManagerService } from "../src/app/modules/manager/manager.service.js";
import { connectRedis, redisClient } from "../src/app/config/redis.config.js";

async function main() {
    console.log("🚀 Starting Role-Based User Creation Verification...");

    const timestamp = Date.now();
    const farmName = `Test Farm ${timestamp}`;
    const farmAdminEmail = `admin_${timestamp}@test.com`;
    const managerEmail = `manager_${timestamp}@test.com`;
    const employeeEmail = `employee_${timestamp}@test.com`;

    try {
        // 0. Connect Redis
        console.log("🔌 Connecting to Redis...");
        await connectRedis();

        // 1. Setup: Create a Farm directly (Prerequisite)
        console.log(`\n1️⃣ Creating Test Farm: ${farmName}`);
        const farm = await prisma.farm.create({
            data: {
                name: farmName,
                country: "TestCountry",
                defaultLanguage: "en",
                status: "ACTIVE",
            },
        });
        console.log(`✅ Farm Created: ${farm.id}`);

        // 2. Test System Owner -> Farm Admin
        console.log(`\n2️⃣ Testing SystemOwner -> FarmAdmin creation...`);
        // Mock Payload
        const adminPayload = {
            name: "Farm Admin User",
            email: farmAdminEmail,
            farmId: farm.id,
        };
        // Service call
        const adminUser = await SystemAdminService.createFarmAdminIntoDB(adminPayload);
        console.log(`✅ Farm Admin Created: ${adminUser.email} (${adminUser.role})`);

        // 3. Test Farm Admin -> Manager
        console.log(`\n3️⃣ Testing FarmAdmin -> Manager creation...`);
        const managerPayload = {
            name: "Manager User",
            email: managerEmail,
        };
        // Mock req.user for Farm Admin
        const mockAdminUser = { farmId: farm.id, role: "FARM_ADMIN" };

        const managerUser = await FarmAdminService.createManagerIntoDB(managerPayload, mockAdminUser);
        console.log(`✅ Manager Created: ${managerUser.email} (${managerUser.role})`);

        // 4. Test Manager -> Employee
        console.log(`\n4️⃣ Testing Manager -> Employee creation...`);
        const employeePayload = {
            name: "Employee User",
            email: employeeEmail,
        };
        // Mock req.user for Manager
        const mockManagerUser = { farmId: farm.id, role: "MANAGER" };

        const employeeUser = await ManagerService.createEmployeeIntoDB(employeePayload, mockManagerUser);
        console.log(`✅ Employee Created: ${employeeUser.email} (${employeeUser.role})`);

        console.log("\n✨ All tests passed successfully!");

        // Cleanup
        console.log("\n🧹 Cleaning up test data...");
        await prisma.user.deleteMany({
            where: {
                email: { in: [farmAdminEmail, managerEmail, employeeEmail] },
            },
        });
        await prisma.farm.delete({ where: { id: farm.id } });
        console.log("✅ Cleanup done.");

    } catch (error) {
        console.error("\n❌ Test Failed:", error);
        process.exit(1);
    } finally {
        if (redisClient.isOpen) await redisClient.disconnect();
        await prisma.$disconnect();
    }
}

main();
