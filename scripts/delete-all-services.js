import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteAllServices() {
  console.log("Starting to delete all services and related data...");

  try {
    await prisma.$transaction(
      async (tx) => {
        // Step 1: Get all service item IDs
        console.log("Fetching all service item IDs...");
        const allServiceItems = await tx.serviceItem.findMany({
          select: { id: true },
        });
        const serviceItemIds = allServiceItems.map((item) => item.id);
        console.log(`Found ${serviceItemIds.length} service items`);

        // Step 2: Delete all cart items related to service items
        console.log("Deleting all cart items...");
        const cartItemsDeleted = await tx.cartItem.deleteMany({
          where: {
            serviceItemId: {
              in: serviceItemIds,
            },
          },
        });
        console.log(`✓ Deleted ${cartItemsDeleted.count} cart items`);

        // Step 3: Delete all order items related to service items
        console.log("Deleting all order items...");
        const orderItemsDeleted = await tx.orderItem.deleteMany({
          where: {
            serviceItemId: {
              in: serviceItemIds,
            },
          },
        });
        console.log(`✓ Deleted ${orderItemsDeleted.count} order items`);

        // Step 4: Delete all service items
        console.log("Deleting all service items...");
        const serviceItemsDeleted = await tx.serviceItem.deleteMany({});
        console.log(`✓ Deleted ${serviceItemsDeleted.count} service items`);

        // Step 5: Delete all services
        console.log("Deleting all services...");
        const servicesDeleted = await tx.service.deleteMany({});
        console.log(`✓ Deleted ${servicesDeleted.count} services`);

        console.log("\n" + "=".repeat(50));
        console.log("SUMMARY:");
        console.log("=".repeat(50));
        console.log(`Cart Items Deleted:    ${cartItemsDeleted.count}`);
        console.log(`Order Items Deleted:   ${orderItemsDeleted.count}`);
        console.log(`Service Items Deleted: ${serviceItemsDeleted.count}`);
        console.log(`Services Deleted:      ${servicesDeleted.count}`);
        console.log("=".repeat(50));
      },
      {
        timeout: 30000, // 30 seconds timeout
      }
    );

    console.log("\n✅ All services and related data deleted successfully!");
  } catch (error) {
    console.error("\n❌ Error during deletion:", error);
    throw error;
  }
}

// Execute the deletion
await deleteAllServices()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("\nDisconnecting from database...");
    await prisma.$disconnect();
    console.log("Disconnected.");
  });
