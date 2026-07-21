import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    await prisma.category.createMany({
        data: [
            {
                name: "Bridal Chura",
                slug: "bridal-chura"
            },
            {
                name: "Kaleere",
                slug: "kaleere"
            },
            {
                name: "Bangle",
                slug: "bangle"
            },
            {
                name: "Short Chuda",
                slug: "short-chuda"
            }
        ]
    });

    console.log("Categories Seeded");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    })