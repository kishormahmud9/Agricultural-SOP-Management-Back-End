import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const sop = await prisma.sOP.findUnique({
    where: {
      id: "c1499c4e-1caa-4796-9a1a-a793df0f78d4",
    },
  });

  const user = await prisma.user.findFirst({
    where: {
      role: "FARM_ADMIN",
    },
  });

  if (sop && user) {
    console.log("--- FARM ID CHECK ---");
    console.log("SOP Farm ID:", sop.farmId);
    console.log("User Farm ID:", user.farmId);
    console.log("Match:", sop.farmId === user.farmId);
    console.log("---------------------");
  } else {
    console.log("Record not found");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
