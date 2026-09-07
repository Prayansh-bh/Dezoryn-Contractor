import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_PRODUCTS, DEFAULT_SITE_SETTINGS } from "../shared/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Initial Products
  for (let i = 0; i < DEFAULT_PRODUCTS.length; i++) {
    const product = DEFAULT_PRODUCTS[i];
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        kicker: product.kicker,
        description: product.description,
        features: product.features,
        uses: product.uses,
        specs: product.specs,
        sortOrder: i + 1,
        active: true,
      },
      create: {
        slug: product.slug,
        name: product.name,
        kicker: product.kicker,
        description: product.description,
        features: product.features,
        uses: product.uses,
        specs: product.specs,
        sortOrder: i + 1,
        active: true,
      },
    });
  }
  console.log(`✅ Seeded ${DEFAULT_PRODUCTS.length} initial products.`);

  // 2. Seed Default Site Settings
  for (const [key, value] of Object.entries(DEFAULT_SITE_SETTINGS)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  console.log("✅ Seeded default website settings.");

  // 3. Seed Default Admin User
  const initialEmail = process.env.INITIAL_ADMIN_EMAIL || "havenblue83@gmail.com";
  const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || "Admin@Dezoryn2026!Secure";

  // Check if ANY admin account already exists with valid credentials in database
  const existingAdmin = await prisma.adminUser.findFirst();

  if (existingAdmin && existingAdmin.passwordHash && existingAdmin.passwordHash.length > 10) {
    console.log(`ℹ️ Administrator account (${existingAdmin.email}) already exists; preserving existing credentials in database.`);
  } else {
    const passwordHash = await bcrypt.hash(initialPassword, 12);
    await prisma.adminUser.upsert({
      where: { email: initialEmail },
      update: { name: "Dezoryn Admin", role: "admin", passwordHash },
      create: {
        email: initialEmail,
        name: "Dezoryn Admin",
        role: "admin",
        passwordHash,
      },
    });
    console.log("✅ Seeded administrator credentials securely.");
  }

  // 4. Seed Initial Gallery Media (if gallery is completely empty)
  const galleryCount = await prisma.galleryItem.count();
  if (galleryCount === 0) {
    const defaultGallery = [
      {
        title: "Thermoplastic Expressway Paving & Marking",
        caption: "High-speed automated application on 8-lane highway corridor under MORTH 803.",
        fileName: "thermoplastic-paint.jpg",
        mediaType: "image",
        contentType: "image/jpeg",
        featured: true,
      },
      {
        title: "Retro-Reflective Micro Glass Beads Lab QC",
        caption: "Testing optical retroreflectivity under directional light beam for night luminance.",
        fileName: "reflective-glass-beads.jpg",
        mediaType: "image",
        contentType: "image/jpeg",
        featured: true,
      },
      {
        title: "High-Contrast Kerb & Divider Barrier Coatings",
        caption: "Long-lasting UV-resistant kerb paint on highway median barrier.",
        fileName: "kerb-barrier-coatings.jpg",
        mediaType: "image",
        contentType: "image/jpeg",
        featured: false,
      },
      {
        title: "Solar & Cat-Eye Highway Road Studs",
        caption: "Lane delineation and night curve warning studs with 360-degree reflective prismatic lenses.",
        fileName: "road-studs-delineators.jpg",
        mediaType: "image",
        contentType: "image/jpeg",
        featured: true,
      },
      {
        title: "Project Safety Hardware & Barricades",
        caption: "Heavy-duty traffic cones and high-visibility work zone bollards.",
        fileName: "traffic-safety-products.jpg",
        mediaType: "image",
        contentType: "image/jpeg",
        featured: false,
      },
      {
        title: "Automated Material Batching Facility",
        caption: "Standardized chemical blending and temperature-controlled compounding.",
        fileName: "custom-manufacturing.jpg",
        mediaType: "image",
        contentType: "image/jpeg",
        featured: false,
      },
    ];

    for (const item of defaultGallery) {
      await prisma.galleryItem.create({
        data: {
          title: item.title,
          caption: item.caption,
          mediaType: item.mediaType,
          objectKey: `gallery/default-${item.fileName}`,
          fileName: item.fileName,
          contentType: item.contentType,
          featured: item.featured,
          active: true,
        },
      });
    }
    console.log(`✅ Seeded ${defaultGallery.length} initial gallery media items.`);
  }

  console.log("🎉 Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
