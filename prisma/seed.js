import bcrypt from "bcrypt";
import prisma from "../src/app/prisma/client.js";

const PASSWORD = "11";

// ===============================
// SEED FUNCTION
// ===============================
async function main() {
  console.log("🌱 Seeding database...");

  // -------------------------------
  // 1️⃣ Create PLANS
  // -------------------------------

  const basicPlan = await prisma.plan.upsert({
    where: { name: "Basic" },
    update: {
      priceMonthly: 20,
      priceYearly: 240,
      stripeMonthlyPriceId: "price_1T8QqwQ11TGqLUwmS9ntY7kx",
      stripeYearlyPriceId: "price_1T8QrbQ11TGqLUwm1GmQJ2Kl",
      employeeLimit: 10,
      isActive: true
    },
    create: {
      name: "Basic",
      priceMonthly: 20,
      priceYearly: 240,
      stripeMonthlyPriceId: "price_1T8QqwQ11TGqLUwmS9ntY7kx",
      stripeYearlyPriceId: "price_1T8QrbQ11TGqLUwm1GmQJ2Kl",
      employeeLimit: 10,
      isActive: true
    }
  });

  const standardPlan = await prisma.plan.upsert({
    where: { name: "Standard" },
    update: {
      priceMonthly: 30,
      priceYearly: 360,
      stripeMonthlyPriceId: "price_1T9CnOQ11TGqLUwmNQtR1AvA",
      stripeYearlyPriceId: "price_1T9CnjQ11TGqLUwm7hD86H8d",
      employeeLimit: 25,
      isActive: true
    },
    create: {
      name: "Standard",
      priceMonthly: 30,
      priceYearly: 360,
      stripeMonthlyPriceId: "price_1T9CnOQ11TGqLUwmNQtR1AvA",
      stripeYearlyPriceId: "price_1T9CnjQ11TGqLUwm7hD86H8d",
      employeeLimit: 25,
      isActive: true
    }
  });

  const professionalPlan = await prisma.plan.upsert({
    where: { name: "Professional" },
    update: {
      priceMonthly: 50,
      priceYearly: 600,
      stripeMonthlyPriceId: "price_1T8QqwQ11TGqLUwmS9ntY7kx",
      stripeYearlyPriceId: "price_1T8QrbQ11TGqLUwm1GmQJ2Kl",
      employeeLimit: 9999,
      isActive: true
    },
    create: {
      name: "Professional",
      priceMonthly: 50,
      priceYearly: 600,
      stripeMonthlyPriceId: "price_1T8QqwQ11TGqLUwmS9ntY7kx",
      stripeYearlyPriceId: "price_1T8QrbQ11TGqLUwm1GmQJ2Kl",
      employeeLimit: 9999,
      isActive: true
    }
  });

  console.log("✅ Plans created:", [
    basicPlan.name,
    standardPlan.name,
    professionalPlan.name
  ]);

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

  // SYSTEM OWNER
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