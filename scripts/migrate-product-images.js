const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateProductImages() {
  try {
    console.log('Starting product images migration...\n');

    // Fetch all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        images: true,
      },
    });

    console.log(`Found ${products.length} products to check\n`);

    let updatedCount = 0;

    for (const product of products) {
      // If product has a main image but no additional images, add the main image to the array
      if (product.image && (!product.images || product.images.length === 0)) {
        console.log(`Updating product: ${product.name}`);
        console.log(`  Current image: ${product.image}`);
        console.log(`  Adding to images array...`);

        await prisma.product.update({
          where: { id: product.id },
          data: {
            images: [product.image], // You can add more duplicate images here if needed
          },
        });

        updatedCount++;
        console.log(`  ✓ Updated\n`);
      } else if (product.images && product.images.length > 0) {
        console.log(`Skipping product: ${product.name} (already has ${product.images.length} images)`);
      } else {
        console.log(`Skipping product: ${product.name} (no main image)`);
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   Updated: ${updatedCount} products`);
    console.log(`   Skipped: ${products.length - updatedCount} products`);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateProductImages();
