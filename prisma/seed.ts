import { PrismaClient } from "@prisma/client";
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
  await prisma.adminUser.upsert({
    where: { email: "havenblue83@gmail.com" },
    update: { name: "Dezoryn Admin", role: "admin" },
    create: { email: "havenblue83@gmail.com", name: "Dezoryn Admin", role: "admin" },
  });
  console.log("✅ Seeded default admin user.");

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
