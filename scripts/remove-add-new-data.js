import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const singleServiceData = [
  {
    slug: "steam-pressing-service",
    title: "Steam Pressing Service",
    description:
      "Professional steam pressing for delicate and formal garments.",
    fullDescription:
      "Professional steam iron services tailored for clothes that look sharp and feel fresh. From everyday wear to delicate garments, our steam press treatment gives your outfits a polished, well-kept finish. Enjoy doorstep convenience in Dubai with expert care, and results you’ll appreciate  every time.",
    rating: 4.9,
    reviews: 189,
    duration: "2-3 days",
    items: {
      men: [
        {
          id: "msp1",
          name: "T-shirts/Shirts",
          price: 3,
          description: "Casual and formal shirts",
        },
        {
          id: "msp2",
          name: "Trouser",
          price: 3,
          description: "Casual pants, formal trousers",
        },
        {
          id: "msp3",
          name: "Kandura",
          price: 6,
          description: "Traditional Kandora",
        },
        { id: "msp4", name: "Ghatra", price: 5, description: "Headwear" },
        { id: "msp5", name: "Lungi", price: 4, description: "Casual wear" },
        { id: "msp6", name: "Shorts", price: 3, description: "Casual shorts" },
        { id: "msp7", name: "Cap/Tie", price: 3, description: "Caps and ties" },
        {
          id: "msp8",
          name: "Jacket/Coat",
          price: 8,
          description: "Blazers, winter coats",
        },
        {
          id: "msp9",
          name: "Waist Coat",
          price: 5,
          description: "Formal waistcoats",
        },
        {
          id: "msp10",
          name: "Suit (2 pcs)",
          price: 12,
          description: "Two-piece business suits",
        },
        {
          id: "msp11",
          name: "Suit (3 pcs)",
          price: 15,
          description: "Three-piece business suits",
        },
        {
          id: "msp12",
          name: "Inner Wear",
          price: 2,
          description: "Delicate undergarments",
        },
        {
          id: "msp13",
          name: "Socks/ Handkerchief",
          price: 2,
          description: "Pairs of socks, Handkerchiefs",
        },
        {
          id: "msp14",
          name: "Sweater",
          price: 5,
          description: "Delicate sweaters",
        },
        {
          id: "msp15",
          name: "Salwar Kameez",
          price: 8,
          description: "Salwar Kameez",
        },
      ],
      women: [
        {
          id: "wsp1",
          name: "T-shirts/Shirts",
          price: 3,
          description: "Casual tops, blouses",
        },
        {
          id: "wsp2",
          name: "Trouser",
          price: 3,
          description: "Trousers, jeans, leggings",
        },
        {
          id: "wsp3",
          name: "Abbaya",
          price: 7,
          description: "Traditional Abbaya",
        },
        {
          id: "wsp4",
          name: "Scarf/Dupatta",
          price: 4,
          description: "Scarves and dupattas",
        },
        {
          id: "wsp5",
          name: "Skirt/Shorts",
          price: 3,
          description: "Skirts and shorts",
        },
        {
          id: "wsp6",
          name: "Full Dress",
          price: 6,
          description: "Formal and cocktail dresses",
        },
        {
          id: "wsp7",
          name: "Salwar Kameez",
          price: 8,
          description: "Traditional attire",
        },
        {
          id: "wsp8",
          name: "Blouse",
          price: 4,
          description: "Silk and delicate blouses",
        },
        {
          id: "wsp9",
          name: "Saree",
          price: 10,
          description: "Silk and formal Saree",
        },
        {
          id: "wsp10",
          name: "Coat/Jacket",
          price: 8,
          description: "Winter coats, blazers",
        },
        {
          id: "wsp11",
          name: "Suit (2 pcs)",
          price: 12,
          description: "Two-piece suits",
        },
        {
          id: "wsp12",
          name: "Suit (3 pcs)",
          price: 15,
          description: "Three-piece suits",
        },
        {
          id: "wsp13",
          name: "Sweater",
          price: 5,
          description: "Delicate sweaters",
        },
        {
          id: "wsp14",
          name: "Inner Wear",
          price: 2,
          description: "Delicate undergarments",
        },
      ],
      household: [
        {
          id: "hsp1",
          name: "Police Dress/Safari Dress",
          price: 8,
          description: "Uniform cleaning",
        },
        {
          id: "hsp2",
          name: "Duvet Cover (Single)",
          price: 6,
          description: "Single sized Duvet covers",
        },
        {
          id: "hsp3",
          name: "Duvet Cover (Double)",
          price: 8,
          description: "Double sized Duvet covers",
        },
        {
          id: "hsp4",
          name: "Bed Sheet (Single)",
          price: 6,
          description: "Single sized Bed sheets",
        },
        {
          id: "hsp5",
          name: "Bed Sheet (Double)",
          price: 8,
          description: "Double sized Bed sheets",
        },
        {
          id: "hsp6",
          name: "Pillow Case",
          price: 2,
          description: "Pillow Case",
        },
        {
          id: "hsp7",
          name: "Cushion Cover",
          price: 3,
          description: "Cushion Cover",
        },
        {
          id: "hsp8",
          name: "Table Cloth",
          price: 5,
          description: "Table Cloth",
        },
        {
          id: "hsp9",
          name: "Table Napkins",
          price: 2,
          description: "Napkins",
        },
        {
          id: "hsp10",
          name: "Wedding Dress Normal",
          price: 45,
          description: "Normal Wedding Dress",
        },
        {
          id: "hsp11",
          name: "Curtains (Per Sq meter)",
          price: 20,
          description: "Curtains steam press",
        },
      ],
    },
  },
];

// Alternative version with transaction for better safety
async function mainWithTransaction() {
  console.log("Start replacing service data with transaction ...");

  try {
    await prisma.$transaction(
      async (tx) => {
        for (const s of singleServiceData) {
          console.log(`Processing service: ${s.title}`);

          // First, find or create the service
          const service = await tx.service.upsert({
            where: { slug: s.slug },
            update: {
              title: s.title,
              description: s.description,
              fullDescription: s.fullDescription,
              rating: s.rating,
              reviews: s.reviews,
              duration: s.duration,
            },
            create: {
              slug: s.slug,
              title: s.title,
              description: s.description,
              fullDescription: s.fullDescription,
              rating: s.rating,
              reviews: s.reviews,
              duration: s.duration,
            },
          });

          console.log(`Service processed: ${s.title}`);

          // Delete all related records in batch operations (more efficient)
          console.log("Deleting related cart items...");
          const cartItemsDeleted = await tx.cartItem.deleteMany({
            where: {
              serviceItem: {
                serviceId: service.id,
              },
            },
          });
          console.log(`Deleted ${cartItemsDeleted.count} cart items`);

          console.log("Deleting related order items...");
          const orderItemsDeleted = await tx.orderItem.deleteMany({
            where: {
              serviceItem: {
                serviceId: service.id,
              },
            },
          });
          console.log(`Deleted ${orderItemsDeleted.count} order items`);

          // Now delete the service items
          console.log("Deleting service items...");
          const deletedCount = await tx.serviceItem.deleteMany({
            where: { serviceId: service.id },
          });

          console.log(
            `Removed ${deletedCount.count} existing items for service: ${s.title}`
          );

          // Add all new items in batch
          const newItems = [];
          for (const [category, items] of Object.entries(s.items)) {
            for (const [index, item] of items.entries()) {
              newItems.push({
                serviceId: service.id,
                itemId: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                unit: item.unit || null,
                image: item.image || null,
                category,
                sortOrder: index,
              });
            }
          }

          // Create all items at once
          await tx.serviceItem.createMany({
            data: newItems,
          });

          console.log(`Total items added for ${s.title}: ${newItems.length}`);
        }
      },
      {
        timeout: 30000, // 30 seconds timeout
      }
    );

    console.log("Service data replacement finished successfully!");
  } catch (error) {
    console.error("Error during transaction:", error);
    throw error;
  }
}

await mainWithTransaction()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
