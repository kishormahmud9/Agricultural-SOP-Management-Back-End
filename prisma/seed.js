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
      stripeMonthlyPriceId: "price_1T9CkpQ11TGqLUwmg8pCKrTf",
      stripeYearlyPriceId: "price_1T9ClSQ11TGqLUwmO4h10oc7",
      employeeLimit: 10,
      trialDays: 14,
      isActive: true,
      features: [
        "Up to 10 Users",
        "SOP creation & execution",
        "Task assignment",
        "Completion tracking",
      ],
    },
    create: {
      name: "Basic",
      priceMonthly: 20,
      priceYearly: 240,
      stripeMonthlyPriceId: "price_1T9CkpQ11TGqLUwmg8pCKrTf",
      stripeYearlyPriceId: "price_1T9ClSQ11TGqLUwmO4h10oc7",
      employeeLimit: 10,
      trialDays: 14,
      isActive: true,
      features: [
        "Up to 10 Users",
        "SOP creation & execution",
        "Task assignment",
        "Completion tracking",
      ],
    },
  });

  const standardPlan = await prisma.plan.upsert({
    where: { name: "Standard" },
    update: {
      priceMonthly: 30,
      priceYearly: 360,
      stripeMonthlyPriceId: "price_1T9CnOQ11TGqLUwmNQtR1AvA",
      stripeYearlyPriceId: "price_1T9CnjQ11TGqLUwm7hD86H8d",
      employeeLimit: 25,
      trialDays: 14,
      isActive: true,
      features: [
        "Up to 25 Users",
        "Everything in Basic",
        "Faster support",
        "Better usability",
      ],
    },
    create: {
      name: "Standard",
      priceMonthly: 30,
      priceYearly: 360,
      stripeMonthlyPriceId: "price_1T9CnOQ11TGqLUwmNQtR1AvA",
      stripeYearlyPriceId: "price_1T9CnjQ11TGqLUwm7hD86H8d",
      employeeLimit: 25,
      trialDays: 14,
      isActive: true,
      features: [
        "Up to 25 Users",
        "Everything in Basic",
        "Faster support",
        "Better usability",
      ],
    },
  });

  const professionalPlan = await prisma.plan.upsert({
    where: { name: "Professional" },
    update: {
      priceMonthly: 50,
      priceYearly: 600,
      stripeMonthlyPriceId: "price_1T8QqwQ11TGqLUwmS9ntY7kx",
      stripeYearlyPriceId: "price_1T8QrbQ11TGqLUwm1GmQJ2Kl",
      employeeLimit: 35,
      trialDays: 14,
      isActive: true,
      features: [
        "Up to 35 Users",
        "Everything in Standard",
        "Priority onboarding",
        "Early access to features",
      ],
    },
    create: {
      name: "Professional",
      priceMonthly: 50,
      priceYearly: 600,
      stripeMonthlyPriceId: "price_1T8QqwQ11TGqLUwmS9ntY7kx",
      stripeYearlyPriceId: "price_1T8QrbQ11TGqLUwm1GmQJ2Kl",
      employeeLimit: 35,
      trialDays: 14,
      isActive: true,
      features: [
        "Up to 35 Users",
        "Everything in Standard",
        "Priority onboarding",
        "Early access to features",
      ],
    },
  });

  console.log("✅ Plans created:", [
    basicPlan.name,
    standardPlan.name,
    professionalPlan.name,
  ]);

  // -------------------------------
  // 2️⃣ Create FARM
  // -------------------------------
  const farm = await prisma.farm.upsert({
    where: { id: "demo-farm-id" }, // Using a fixed ID for demo to make it idempotent
    update: {
      name: "Demo Farm",
      country: "Bangladesh",
      defaultLanguage: "en",
      status: "ACTIVE",
    },
    create: {
      id: "demo-farm-id",
      name: "Demo Farm",
      country: "Bangladesh",
      defaultLanguage: "en",
      status: "ACTIVE",
    },
  });

  console.log("✅ Farm created:", farm.name);

  // -------------------------------
  // 3️⃣ Create SUBSCRIPTION
  // -------------------------------
  const subscription = await prisma.subscription.upsert({
    where: { farmId: farm.id },
    update: {
      planId: basicPlan.id,
      status: "ACTIVE",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      price: basicPlan.priceMonthly,
    },
    create: {
      farmId: farm.id,
      planId: basicPlan.id,
      status: "ACTIVE",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      price: basicPlan.priceMonthly,
    },
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
  const systemOwner = await prisma.user.upsert({
    where: { email: "system@test.com" },
    update: {
      name: "System Owner",
      passwordHash,
      role: "SYSTEM_OWNER",
      status: "ACTIVE",
      isVerified: true,
    },
    create: {
      name: "System Owner",
      email: "system@test.com",
      passwordHash,
      role: "SYSTEM_OWNER",
      status: "ACTIVE",
      isVerified: true,
    },
  });

  // FARM ADMIN
  const farmAdmin = await prisma.user.upsert({
    where: { email: "farmadmin@test.com" },
    update: {
      name: "Farm Admin",
      passwordHash,
      role: "FARM_ADMIN",
      status: "ACTIVE",
      isVerified: true,
      farmId: farm.id,
    },
    create: {
      name: "Farm Admin",
      email: "farmadmin@test.com",
      passwordHash,
      role: "FARM_ADMIN",
      status: "ACTIVE",
      isVerified: true,
      farmId: farm.id,
    },
  });

  // MANAGER
  const manager = await prisma.user.upsert({
    where: { email: "manager@test.com" },
    update: {
      name: "Manager User",
      passwordHash,
      role: "MANAGER",
      status: "ACTIVE",
      isVerified: true,
      farmId: farm.id,
    },
    create: {
      name: "Manager User",
      email: "manager@test.com",
      passwordHash,
      role: "MANAGER",
      status: "ACTIVE",
      isVerified: true,
      farmId: farm.id,
    },
  });

  // EMPLOYEE
  const employee = await prisma.user.upsert({
    where: { email: "employee@test.com" },
    update: {
      name: "Employee User",
      passwordHash,
      role: "EMPLOYEE",
      status: "ACTIVE",
      isVerified: true,
      farmId: farm.id,
    },
    create: {
      name: "Employee User",
      email: "employee@test.com",
      passwordHash,
      role: "EMPLOYEE",
      status: "ACTIVE",
      isVerified: true,
      farmId: farm.id,
    },
  });

  console.log("✅ Users created:");
  console.table([
    { role: systemOwner.role, email: systemOwner.email },
    { role: farmAdmin.role, email: farmAdmin.email },
    { role: manager.role, email: manager.email },
    { role: employee.role, email: employee.email },
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
