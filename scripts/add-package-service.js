import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// change the "standard" to add new package

async function seedServiceWithItem() {
  // 1. Ensure service exists
  const service = await prisma.service.upsert({
    where: { slug: "standard-package-service" },
    update: {},
    create: {
      slug: "standard-package-service",
      title: "Standard Package Service",
      description: "Basic laundry package",
      fullDescription: "Standard package service",
      rating: 5.0,
      reviews: 0,
      duration: "3 days",
      image: null,
    },
  });

  console.log("Service seeded:", service.slug);

  // 2. Add an item under this service
  await prisma.serviceItem.upsert({
    where: { id: "standard" }, // primary key reference
    update: {},
    create: {
      id: "standard", // custom primary key
      itemId: "standard-001", // 👈 required business ID
      category: "Package Item", // 👈 required category
      name: "Standard Package Items",
      description: "Washing and Ironing of Items",
      price: 18,
      unit: "per package", // optional
      image: null,
      serviceId: service.id, // foreign key link
      sortOrder: 1,
    },
  });

  console.log("Service item seeded successfully");
}

seedServiceWithItem()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
