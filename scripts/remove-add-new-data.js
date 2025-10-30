import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const servicesData = [
  // 1. LAUNDRY SERVICES (WASH & PRESS)
  {
    slug: "laundry-services",
    title: "Laundry Services (Wash & Press)",
    description: "Professional wash and press for all your clothing needs.",
    fullDescription:
      "Our comprehensive laundry services include washing and pressing of all types of clothing. We use premium detergents to ensure your clothes come back fresh, clean, and wrinkle-free.",
    rating: 4.8,
    reviews: 245,
    duration: "24-48 hours",
    items: {
      men: [
        {
          id: "m1",
          name: "T-shirts/Shirts",
          price: 6,
          description: "Casual and formal shirts",
        },
        {
          id: "m2",
          name: "Trouser",
          price: 6,
          description: "Casual pants, formal trousers, Jeans, Pajama",
        },
        {
          id: "m3",
          name: "Kandora",
          price: 10,
          description: "Traditional Kandora",
        },
        { id: "m4", name: "Ghatra", price: 8, description: "Headwear" },
        { id: "m5", name: "Lungi", price: 6, description: "Casual wear" },
        { id: "m6", name: "Shorts", price: 6, description: "Casual shorts" },
        { id: "m7", name: "Cap/Tie", price: 5, description: "Caps and ties" },
        {
          id: "m8",
          name: "Jacket/Coat",
          price: 15,
          description: "Light jackets and coats",
        },
        {
          id: "m9",
          name: "Waist Coat",
          price: 10,
          description: "Formal waistcoats",
        },
        {
          id: "m10",
          name: "Leather Jacket",
          price: 25,
          description: "Leather jackets",
        },
        { id: "m11", name: "Sweater", price: 10, description: "Knit sweaters" },
        {
          id: "m12",
          name: "Inner Wear",
          price: 4,
          description: "Undergarments",
        },
        {
          id: "m13",
          name: "Socks (Pair)",
          price: 4,
          description: "Pairs of socks",
        },

        {
          id: "m14",
          name: "Handkerchiefs",
          price: 2,
          description: "Handkerchiefs",
        },
      ],
      women: [
        {
          id: "w1",
          name: "T-shirts/Shirts",
          price: 6,
          description: "Casual tops, blouses",
        },
        {
          id: "w2",
          name: "Trouser",
          price: 6,
          description: "Trousers, jeans, leggings, Pajama",
        },
        {
          id: "w3",
          name: "Abbaya/Burqah",
          price: 10,
          description: "Traditional Abbaya and Burqah",
        },
        {
          id: "w4",
          name: "Scarf/Dupatta",
          price: 6,
          description: "Scarves and dupattas",
        },
        {
          id: "w5",
          name: "Skirt/Shorts",
          price: 6,
          description: "Skirts and shorts",
        },
        {
          id: "w6",
          name: "Full Dress",
          price: 12,
          description: "Casual and formal dresses",
        },
        {
          id: "w7",
          name: "Salwar Kameez",
          price: 12,
          description: "Traditional attire",
        },
        {
          id: "w8",
          name: "Blouse",
          price: 8,
          description: "Formal and casual blouses",
        },
        {
          id: "w9",
          name: "Saree",
          price: 12,
          description: "Traditional Saree",
        },
        {
          id: "w10",
          name: "Coat/Jacket",
          price: 15,
          description: "Jackets and coats",
        },
        {
          id: "w11",
          name: "Sweater/ Pull over",
          price: 10,
          description: "Sweaters, Pullovers, Jumpers",
        },

        {
          id: "w12",
          name: "Inner Wear",
          price: 4,
          description: "Undergarments, lingerie",
        },
        {
          id: "w13",
          name: "Handkerchief",
          price: 2,
          description: "Handkerchief",
        },
      ],
      children: [
        { id: "c1", name: "T-Shirt", price: 4, description: "For ages 2-12" },
        {
          id: "c2",
          name: "Shorts/Skirt",
          price: 4,
          description: "For ages 2-12",
        },
        { id: "c3", name: "Trousers", price: 5, description: "For ages 2-12" },
        { id: "c4", name: "Dress", price: 8, description: "For ages 2-12" },
        { id: "c5", name: "Jacket", price: 10, description: "For ages 2-12" },
      ],
      household: [
        {
          id: "h1",
          name: "Police Dress/Safari Dress",
          price: 14,
          description: "Uniform cleaning",
        },
        {
          id: "h2",
          name: "Duvet Cover (Single)",
          price: 10,
          description: "Single sized duvet cover",
        },
        {
          id: "h3",
          name: "Duvet Cover (Double)",
          price: 12,
          description: "Double sized duvet cover",
        },
        {
          id: "h4",
          name: "Blanket (Single)",
          price: 25,
          description: "Single sized blanket",
        },
        {
          id: "h5",
          name: "Blanket (Double)",
          price: 35,
          description: "Double sized blanket",
        },
        {
          id: "h6",
          name: "Duvet Small",
          price: 20,
          description: "Duvet small",
        },
        {
          id: "h7",
          name: "Duvet Medium",
          price: 25,
          description: "Duvet medium",
        },
        {
          id: "h8",
          name: "Duvet Large",
          price: 30,
          description: "Duvet large",
        },

        {
          id: "h9",
          name: "Bed Sheet (Single)",
          price: 10,
          description: "Single sized bedsheet",
        },
        {
          id: "h10",
          name: "Bed Sheet (Double)",
          price: 12,
          description: "Double sized bedsheet",
        },
        { id: "h11", name: "Pillow Case", price: 3, description: "" },
        {
          id: "h12",
          name: "Cushion Cover/ Pillow Cover",
          price: 6,
          description: "Pillow cover any / cusion cover any ",
        },
        { id: "h13", name: "Pillow/Cushion", price: 15, description: "" },
        { id: "h14", name: "Bath Robe", price: 15, description: "" },
        {
          id: "h15",
          name: "Bath Towel (M)",
          price: 4,
          description: "Medium bath towel",
        },
        {
          id: "h16",
          name: "Bath Towel (L)",
          price: 6,
          description: "Large bath towel",
        },
        {
          id: "h17",
          name: "Wedding Dress",
          price: 80,
          description: "Normal wedding dress",
        },
        {
          id: "h18",
          name: "Curtains (Per Sq meter)",
          price: 12,
          description: "Wash & Press",
        },
      ],
    },
  },

  // 2. DRY CLEANING SERVICES
  {
    slug: "dry-cleaning-services",
    title: "Dry Cleaning Services",
    description: "Professional dry cleaning for delicate and formal garments.",
    fullDescription:
      "Our dry cleaning services use eco-friendly solvents to clean delicate fabrics that cannot be washed with water. Perfect for suits, dresses, and specialty items.",
    rating: 4.9,
    reviews: 189,
    duration: "2-3 days",
    items: {
      men: [
        {
          id: "mdc1",
          name: "T-shirts/Shirts",
          price: 8,
          description: "Casual and formal shirts",
        },
        {
          id: "mdc2",
          name: "Trousers",
          price: 8,
          description: "Casual pants, formal trousers, Jeans, Pajama",
        },
        {
          id: "mdc3",
          name: "Kandora",
          price: 12,
          description: "Traditional Kandora",
        },
        { id: "mdc4", name: "Ghatra", price: 10, description: "Headwear" },
        { id: "mdc5", name: "Lungi", price: 8, description: "Casual wear" },
        { id: "mdc6", name: "Shorts", price: 8, description: "Casual shorts" },
        { id: "mdc7", name: "Cap/Tie", price: 8, description: "Caps and ties" },
        {
          id: "mdc8",
          name: "Jacket/Coat",
          price: 20,
          description: "Blazers, winter coats",
        },
        {
          id: "mdc9",
          name: "Leather Jacket",
          price: 35,
          description: "Leather Jackets",
        },
        {
          id: "mdc10",
          name: "Waist Coat",
          price: 15,
          description: "Formal waistcoats",
        },
        {
          id: "mdc11",
          name: "Suit (2 pcs)",
          price: 25,
          description: "Two-piece business suits",
        },
        {
          id: "mdc12",
          name: "Suit (3 pcs)",
          price: 35,
          description: "Three-piece business suits",
        },
        {
          id: "mdc13",
          name: "Inner Wear",
          price: 5,
          description: "Delicate undergarments",
        },
        {
          id: "mdc14",
          name: "Socks (Pair)",
          price: 5,
          description: "Pairs of socks",
        },
        {
          id: "mdc15",
          name: "Sweater/ Pull over",
          price: 14,
          description: "Delicate sweaters, pull overs",
        },
      ],
      women: [
        {
          id: "wdc1",
          name: "T-shirts/Shirts",
          price: 8,
          description: "Casual tops, blouses",
        },
        {
          id: "wdc2",
          name: "Trouser",
          price: 8,
          description: "Trousers, jeans, leggings",
        },
        {
          id: "wdc3",
          name: "Abbaya/Burqah",
          price: 14,
          description: "Traditional Abbaya and Burqah",
        },
        {
          id: "wdc4",
          name: "Scarf/Dupatta",
          price: 8,
          description: "Scarves and dupattas",
        },
        {
          id: "wdc5",
          name: "Skirt/Shorts",
          price: 8,
          description: "Skirts and shorts",
        },
        {
          id: "wdc6",
          name: "Full Dress",
          price: 15,
          description: "Formal and cocktail dresses",
        },
        {
          id: "wdc7",
          name: "Salwar Kameez",
          price: 15,
          description: "Traditional attire",
        },
        {
          id: "wdc8",
          name: "Blouse",
          price: 10,
          description: "Silk and delicate blouses",
        },
        {
          id: "wdc9",
          name: "Saree",
          price: 16,
          description: "Silk and formal Saree",
        },
        {
          id: "wdc10",
          name: "Coat/Jacket",
          price: 20,
          description: "Winter coats, blazers",
        },
        {
          id: "wdc11",
          name: "Suit (2 pcs)",
          price: 25,
          description: "Two-piece suits",
        },
        {
          id: "wdc12",
          name: "Suit (3 pcs)",
          price: 35,
          description: "Three-piece suits",
        },
        {
          id: "wdc13",
          name: "Sweater/ Pull over",
          price: 14,
          description: "Delicate sweaters",
        },
        {
          id: "wdc14",
          name: "Inner Wear",
          price: 5,
          description: "Delicate undergarments",
        },
      ],
      household: [
        {
          id: "hdc1",
          name: "Police Dress/Safari Dress",
          price: 18,
          description: "Uniform cleaning",
        },
        {
          id: "hdc2",
          name: "Duvet Cover (Single)",
          price: 12,
          description: "Single sized duvet cover",
        },
        {
          id: "hdc3",
          name: "Duvet Cover (Double)",
          price: 14,
          description: "Double sized duvet cover",
        },
        {
          id: "hdc4",
          name: "Duvet Small",
          price: 25,
          description: "Duvet small",
        },
        {
          id: "hdc5",
          name: "Duvet Medium",
          price: 30,
          description: "Duvet medium",
        },
        {
          id: "hdc6",
          name: "Duvet Large",
          price: 35,
          description: "Duvet large",
        },

        {
          id: "hdc7",
          name: "Bed Sheet (Single)",
          price: 12,
          description: "Single sized bedsheet",
        },
        {
          id: "hdc8",
          name: "Bed Sheet (Double)",
          price: 14,
          description: "Double sized bedsheet",
        },
        { id: "hdc9", name: "Pillow Case", price: 4, description: "" },
        {
          id: "hdc10",
          name: "Cushion Cover/ Pillow Cover",
          price: 8,
          description: "Pillow cover any / cusion cover any ",
        },
        { id: "hdc11", name: "Pillow/Cushion", price: 20, description: "" },
        {
          id: "hdc12",
          name: "Bath Towel (M)",
          price: 5,
          description: "Medium bath towel",
        },
        {
          id: "hdc13",
          name: "Bath Towel (L)",
          price: 7,
          description: "Large bath towel",
        },
        {
          id: "hdc14",
          name: "Wedding Dress",
          price: 100,
          description: "Normal wedding dress",
        },
        {
          id: "hdc15",
          name: "Curtains (Per Sq meter)",
          price: 18,
          description: "Dry clean curtains",
        },
      ],
    },
  },

  // 3. EXPRESS LAUNDRY
  {
    slug: "express-laundry-services",
    title: "Express Laundry Services",
    description: "Same-day laundry services for when you're in a hurry.",
    fullDescription:
      "Our express laundry service provides same-day turnaround for your urgent laundry needs. We prioritize express orders to ensure you get your garments back within hours, not days.",
    rating: 4.9,
    reviews: 55,
    duration: "4-6 hours",
    items: {
      express: [
        {
          id: "exp1",
          name: "Express Service Charge (per item)",
          price: 5,
          description: "Additional charge for express service",
        },
      ],
    },
  },

  // 4. SHOE & BAG SPA
  {
    slug: "shoe-bag-spa",
    title: "Shoe Cleaning",
    description: "Premium cleaning and restoration services for footwears.",
    fullDescription:
      "Our specialized shoe spa restores your items to like-new condition. We handle everything from sports sneakers to luxury designer items.",
    rating: 4.9,
    reviews: 98,
    duration: "3-5 days",
    items: {
      "shoe-cleaning": [
        {
          id: "s1",
          name: "Formal Shoes",
          price: 100,
          description:
            "Specialized leather care and Standard cleaning for shoes with multiple materials",
        },
        {
          id: "s2",
          name: "Sports Sneakers (Any)",
          price: 80,
          description: "For any type sports sneakers",
        },

        {
          id: "s3",
          name: "Sandals & Flip Flops",
          price: 60,
          description: "Standard cleaning",
        },
        {
          id: "s4",
          name: "Kids Shoe Care (Any)",
          price: 50,
          description: "Gentle cleaning for any type of kids shoe",
        },
      ],
    },
  },

  // 5. LUXURY SHOE CLEANING
  {
    slug: "luxury-shoe-cleaning",
    title: "Luxury Shoe Cleaning",
    description: "Specialized care for high-end designer shoes.",
    fullDescription:
      "Dedicated luxury shoe cleaning service for high-end footwear. Our certified specialists use premium products to maintain and restore your expensive shoes.",
    rating: 5.0,
    reviews: 42,
    duration: "2-4 days",
    items: {
      "luxury-shoes": [
        {
          id: "ls1",
          name: "Designer and Luxury Formal shoes",
          price: 120,
          description: "Premium cleaning for high-end formal shoes",
        },
        {
          id: "ls2",
          name: "Designer and Luxury Sports Sneakers",
          price: 150,
          description: "Premium cleaning for high-end sneakers",
        },
        {
          id: "ls3",
          name: "Designer and Luxury Sandals / Flip Flops",
          price: 100,
          description: "Premium cleaning for high-end sandals / flip flops",
        },
      ],
    },
  },

  // 6. COMMERCIAL LAUNDRY
  {
    slug: "commercial-laundry-service",
    title: "Commercial Laundry Service",
    description: "Bulk laundry services for businesses and institutions.",
    fullDescription:
      "Professional commercial laundry services for businesses, hotels, restaurants, and institutions. We handle large volumes with quick turnaround times. Prices to be shared upon request.",
    rating: 4.8,
    reviews: 67,
    duration: "1-2 days",
    items: {
      "commercial-items": [
        {
          id: "com1",
          name: "Bedsheets single",
          price: 0,
          description: "Price to be shared",
        },
        {
          id: "com2",
          name: "Bedsheets Double",
          price: 0,
          description: "Price to be shared",
        },
        {
          id: "com3",
          name: "Pillow Case",
          price: 0,
          description: "Price to be shared",
        },
        {
          id: "com4",
          name: "Pillow Cover",
          price: 0,
          description: "Price to be shared",
        },
        {
          id: "com5",
          name: "Face Towel",
          price: 0,
          description: "Price to be shared",
        },
        {
          id: "com6",
          name: "Hand Towel",
          price: 0,
          description: "Price to be shared",
        },
        {
          id: "com7",
          name: "Floor Matt",
          price: 0,
          description: "Price to be shared",
        },
        {
          id: "com8",
          name: "Cushion Small",
          price: 0,
          description: "Price to be shared",
        },
        {
          id: "com9",
          name: "Cushion Medium",
          price: 0,
          description: "Price to be shared",
        },
        {
          id: "com10",
          name: "Cushion Large",
          price: 0,
          description: "Price to be shared",
        },
        {
          id: "com11",
          name: "Bathrobe",
          price: 0,
          description: "Price to be shared",
        },
        {
          id: "com12",
          name: "Table Napkin",
          price: 0,
          description: "Price to be shared",
        },
        {
          id: "com13",
          name: "Duvet Cover Single",
          price: 0,
          description: "Price to be shared",
        },
        {
          id: "com14",
          name: "Duvet Cover Large",
          price: 0,
          description: "Price to be shared",
        },
      ],
    },
  },

  // 7. CURTAIN CLEANING
  {
    slug: "curtain-cleaning-service",
    title: "Curtain Cleaning",
    description:
      "Professional cleaning for all your household items, including curtains.",
    fullDescription:
      "From bedsheets and curtains to wedding dresses, we provide expert cleaning services to keep your home fresh and clean.",
    rating: 4.8,
    reviews: 112,
    duration: "2-4 days",
    items: {
      "Curtain-cleaning": [
        {
          id: "cur1",
          name: "Curtains (Per Sq meter)",
          price: 12,
          description: "Wash & Press",
        },
      ],
    },
  },

  // 8. CARPET CLEANING
  {
    slug: "carpet-cleaning-services",
    title: "Carpet Cleaning Service",
    description:
      "Specialized washing and steam cleaning for all types of carpets.",
    fullDescription:
      "Our carpet cleaning services deep clean and restore your carpets, from standard rugs to premium silk and Persian carpets.",
    rating: 4.9,
    reviews: 78,
    duration: "3-5 days",
    items: {
      "carpet-cleaning": [
        {
          id: "cc1",
          name: "Standard Carpet SQM (wash only)",
          price: 20,
          description: "Per square meter",
        },
        {
          id: "cc2",
          name: "Premium Carpet - Silk, Wool, Persian, etc (wash only)",
          price: 80,
          description: "Per square meter, for delicate carpets",
        },
        {
          id: "cc3",
          name: "Prayer Matt",
          price: 15,
          description: "Standard size prayer mats",
        },
        {
          id: "cc4",
          name: "Standard Carpet Sqm (Steam)",
          price: 12,
          description: "Per square meter, steam cleaning",
        },
        {
          id: "cc5",
          name: "Premium Carpet - Silk, Wool, Persian, etc (steam)",
          price: 50,
          description: "Per square meter, for delicate carpets",
        },
      ],
    },
  },

  // 9. SOFT TOY CLEANING
  {
    slug: "soft-toy-cleaning-service",
    title: "Soft Toy Cleaning Service",
    description: "Gentle and hygienic cleaning for soft toys.",
    fullDescription:
      "We provide safe and thorough cleaning for soft toys of all sizes, ensuring they are fresh and hygienic.",
    rating: 4.7,
    reviews: 45,
    duration: "2-3 days",
    items: {
      "toy-cleaning": [
        {
          id: "st1",
          name: "Soft toy cleaning and washing",
          price: 20,
          description: "Standard price, may vary based on toy type",
        },
      ],
    },
  },
  // 10. STEAM PRESSING SERVICES
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
          price: 4,
          description: "Casual and formal shirts",
        },
        {
          id: "msp2",
          name: "Trouser",
          price: 4,
          description: "Casual pants, formal trousers, Jeans, Pajama",
        },
        {
          id: "msp3",
          name: "Kandura",
          price: 6,
          description: "Traditional Kandora",
        },
        { id: "msp4", name: "Ghatra", price: 6, description: "Headwear" },
        { id: "msp5", name: "Lungi", price: 4, description: "Casual wear" },
        { id: "msp6", name: "Shorts", price: 4, description: "Casual shorts" },
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
          price: 6,
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
          name: "Sweater",
          price: 6,
          description: "Delicate sweaters",
        },
        {
          id: "msp14",
          name: "Socks",
          price: 2,
          description: "Pairs of socks",
        },
        {
          id: "msp15",
          name: "Handkerchief",
          price: 1,
          description: "Handkerchiefs",
        },
      ],
      women: [
        {
          id: "wsp1",
          name: "T-shirts/Shirts",
          price: 4,
          description: "Casual tops, blouses",
        },
        {
          id: "wsp2",
          name: "Trouser",
          price: 4,
          description: "Trousers, jeans, leggings",
        },
        {
          id: "wsp3",
          name: "Abbaya/Burqah",
          price: 8,
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
          price: 4,
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
          price: 6,
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
          price: 6,
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
          name: "Sweater/ Pull over",
          price: 6,
          description: "Delicate sweaters",
        },
        {
          id: "wsp14",
          name: "Inner Wear",
          price: 2,
          description: "Delicate undergarments",
        },
        {
          id: "wsp15",
          name: "Handkerchief",
          price: 1,
          description: "Handkerchiefs",
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
          name: "Bed Sheet (Single/Double)",
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
          price: 4,
          description: "Cushion Cover",
        },
        {
          id: "hsp8",
          name: "Wedding Dress Normal",
          price: 45,
          description: "Normal Wedding Dress",
        },
        {
          id: "hsp9",
          name: "Curtains (Per Sq meter)",
          price: 10,
          description: "Wash & Press",
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
        for (const s of servicesData) {
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
