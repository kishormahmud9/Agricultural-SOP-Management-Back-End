import bcrypt from "bcrypt";
import prisma from "../src/app/prisma/client.js";

// ===============================
// SYSTEM OWNER SEED
// ===============================
async function seedSystemOwner() {
  const email = "system@test.com";
  const password = "system123";

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log("✅ System Owner already exists:", email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const systemOwner = await prisma.user.create({
    data: {
      name: "System Owner",
      email,
      passwordHash,
      role: "SYSTEM_OWNER",
      status: "ACTIVE",
      isVerified: true,
    },
  });

  console.log("🚀 System Owner created successfully");
  console.log({
    email: systemOwner.email,
    role: systemOwner.role,
  });
}

// ===============================
// RUN SEED
// ===============================
async function main() {
  console.log("🌱 Seeding database...");
  await seedSystemOwner();
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
