const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reorganizeSubfamilies() {
  try {
    console.log('Starting subfamily reorganization...\n');

    // First, delete all existing subfamilies
    console.log('Removing old subfamilies...');
    await prisma.subfamily.deleteMany({});
    console.log('✓ Old subfamilies removed\n');

    // Create new subfamilies for the correct structure
    console.log('Creating new subfamilies...\n');

    // Men's subfamilies
    const menFootwear = await prisma.subfamily.create({
      data: { name: 'Footwear', family: 'men', isActive: true }
    });
    console.log(`✓ Created: Footwear (Men) - ID: ${menFootwear.id}`);

    const menBagsAccessories = await prisma.subfamily.create({
      data: { name: 'Bags & Accessories', family: 'men', isActive: true }
    });
    console.log(`✓ Created: Bags & Accessories (Men) - ID: ${menBagsAccessories.id}`);

    // Women's subfamilies
    const womenFootwear = await prisma.subfamily.create({
      data: { name: 'Footwear', family: 'women', isActive: true }
    });
    console.log(`✓ Created: Footwear (Women) - ID: ${womenFootwear.id}`);

    const womenBagsAccessories = await prisma.subfamily.create({
      data: { name: 'Bags & Accessories', family: 'women', isActive: true }
    });
    console.log(`✓ Created: Bags & Accessories (Women) - ID: ${womenBagsAccessories.id}\n`);

    // Get all categories
    const categories = await prisma.category.findMany();
    console.log(`Found ${categories.length} categories to reassign\n`);

    // Assign categories to correct subfamilies
    const categoryMapping = {
      'Formal Shoes': menFootwear.id,
      'Loafers': menFootwear.id,
      'Boots': menFootwear.id,
      'Sneakers': menFootwear.id,
      'Accessories': menBagsAccessories.id
    };

    for (const category of categories) {
      const subfamilyId = categoryMapping[category.name] || menFootwear.id;
      
      await prisma.category.update({
        where: { id: category.id },
        data: { 
          subfamily: {
            connect: { id: subfamilyId }
          }
        }
      });
      
      const subfamily = await prisma.subfamily.findUnique({ where: { id: subfamilyId } });
      console.log(`✓ Assigned "${category.name}" to "${subfamily.name}" (${subfamily.family})`);
    }

    console.log('\n✅ Successfully reorganized subfamilies!');
    console.log('\nNew Structure:');
    console.log('📁 Men');
    console.log('  └─ Footwear');
    console.log('      ├─ Formal Shoes');
    console.log('      ├─ Loafers');
    console.log('      ├─ Boots');
    console.log('      └─ Sneakers');
    console.log('  └─ Bags & Accessories');
    console.log('      └─ Accessories');
    console.log('\n📁 Women');
    console.log('  └─ Footwear');
    console.log('  └─ Bags & Accessories\n');

  } catch (error) {
    console.error('Error reorganizing subfamilies:', error);
  } finally {
    await prisma.$disconnect();
  }
}

reorganizeSubfamilies();
