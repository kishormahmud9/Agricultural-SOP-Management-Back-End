import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const result = await prisma.sOP.groupBy({
        by: ["category"],
        _count: {
            _all: true,
        },
    });
    console.log("Current Categories in DB:", JSON.stringify(result, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
