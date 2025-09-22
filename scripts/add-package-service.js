import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedService() {
  await prisma.service.upsert({
    where: { slug: "package-service" },
    update: {}, // do nothing if it exists
    create: {
      slug: "package-service",
      title: "Package Service",
      description: "Basic laundry package",
      fullDescription: "Full description of package service",
      rating: 5.0,
      reviews: 0,
      duration: "3 days",
      image: null,
    },
  });
  console.log("Service seeded successfully");
}

seedService()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
