import bcrypt from "bcrypt";
import prisma from "../src/app/prisma/client.js";

const PASSWORD = "11";

// ===============================
// SEED FUNCTION
// ===============================
async function main() {
  console.log("🌱 Seeding database...");

  // -------------------------------
  // 1️⃣ Create PLAN (Basic)
  // -------------------------------
  const basicPlan = await prisma.plan.upsert({
    where: { name: "Basic" },
    update: {},
    create: {
      name: "Basic",
      priceMonthly: 10,
      priceYearly: 100,
      employeeLimit: 5,
      trialDays: 7,
      isActive: true
    }
  });

  console.log("✅ Plan created:", basicPlan.name);

  // -------------------------------
  // 2️⃣ Create FARM
  // -------------------------------
  const farm = await prisma.farm.create({
    data: {
      name: "Demo Farm",
      country: "Bangladesh",
      defaultLanguage: "en",
      status: "ACTIVE"
    }
  });

  console.log("✅ Farm created:", farm.name);

  // -------------------------------
  // 3️⃣ Create SUBSCRIPTION
  // -------------------------------
  const subscription = await prisma.subscription.create({
    data: {
      farmId: farm.id,
      planId: basicPlan.id,
      status: "ACTIVE",
      startDate: new Date(),
      endDate: new Date(
        new Date().setMonth(new Date().getMonth() + 1)
      ),
      price: basicPlan.priceMonthly
    }
  });

  console.log("✅ Subscription created:", subscription.status);

  // -------------------------------
  // 4️⃣ Password Hash
  // -------------------------------
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // -------------------------------
  // 5️⃣ Create USERS
  // -------------------------------

  // SYSTEM OWNER (no farm)
  const systemOwner = await prisma.user.create({
    data: {
      name: "System Owner",
      email: "system@test.com",
      passwordHash,
      role: "SYSTEM_OWNER",
      status: "ACTIVE",
      isVerified: true
    }
  });

  // FARM ADMIN
  const farmAdmin = await prisma.user.create({
    data: {
      name: "Farm Admin",
      email: "farmadmin@test.com",
      passwordHash,
      role: "FARM_ADMIN",
      status: "ACTIVE",
      isVerified: true,
      farmId: farm.id
    }
  });

  // MANAGER
  const manager = await prisma.user.create({
    data: {
      name: "Manager User",
      email: "manager@test.com",
      passwordHash,
      role: "MANAGER",
      status: "ACTIVE",
      isVerified: true,
      farmId: farm.id
    }
  });

  // EMPLOYEE
  const employee = await prisma.user.create({
    data: {
      name: "Employee User",
      email: "employee@test.com",
      passwordHash,
      role: "EMPLOYEE",
      status: "ACTIVE",
      isVerified: true,
      farmId: farm.id
    }
  });

  console.log("✅ Users created:");
  console.table([
    { role: systemOwner.role, email: systemOwner.email },
    { role: farmAdmin.role, email: farmAdmin.email },
    { role: manager.role, email: manager.email },
    { role: employee.role, email: employee.email }
  ]);

  console.log("🎉 Database seeding completed successfully!");
}

// ===============================
// RUN SEED
// ===============================
main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
