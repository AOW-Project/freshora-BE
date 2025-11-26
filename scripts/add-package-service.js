import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// change the "standard" to add new package

async function seedServiceWithItem() {
  // 1. Ensure service exists
  const service = await prisma.service.upsert({
    where: { slug: "custom-service" },
    update: { title: "Custom Service" },
    create: {
      slug: "custom-service",
      title: "Custom Service",
      description: "Custom laundry service",
      fullDescription: "Custom laundry service",
      rating: 5.0,
      reviews: 0,
      duration: "3 days",
      image: null,
    },
  });

  console.log("Service seeded:", service.slug);

  // 2. Add an item under this service
  // await prisma.serviceItem.upsert({
  //   where: { id: "custom" }, // primary key reference
  //   update: {},
  //   create: {
  //     id: "custom", // custom primary key
  //     itemId: "custom-001", //  required business ID
  //     category: "Custom Item", //  required category
  //     name: "custom Package Items",
  //     description: "Custom service description",
  //     price: null,
  //     unit: "per package", // optional
  //     image: null,
  //     serviceId: service.id, // foreign key link
  //     sortOrder: 1,
  //   },
  // });

  // console.log("Service item seeded successfully");
}

seedServiceWithItem()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
