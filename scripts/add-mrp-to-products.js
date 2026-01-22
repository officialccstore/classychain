const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMRPToProducts() {
  try {
    console.log('Adding MRP to existing products...\n');

    // Fetch all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        mrp: true,
      },
    });

    console.log(`Found ${products.length} products\n`);

    let updatedCount = 0;

    for (const product of products) {
      // If product doesn't have MRP, set it to 20% higher than current price
      // This assumes current price is the offer price
      if (!product.mrp) {
        const calculatedMRP = Math.round(product.price * 1.2); // 20% markup
        
        console.log(`Updating: ${product.name}`);
        console.log(`  Current Price (Offer): ₹${product.price}`);
        console.log(`  Setting MRP: ₹${calculatedMRP}`);

        await prisma.product.update({
          where: { id: product.id },
          data: {
            mrp: calculatedMRP,
          },
        });

        updatedCount++;
        console.log(`  ✓ Updated\n`);
      } else {
        console.log(`Skipping: ${product.name} (already has MRP: ₹${product.mrp})\n`);
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

addMRPToProducts();
