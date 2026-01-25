const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateToSubfamilies() {
  try {
    console.log('Starting migration to subfamilies...\n');

    // Create default subfamilies for Men
    console.log('Creating subfamilies for Men...');
    const menFormalSubfamily = await prisma.subfamily.create({
      data: { name: 'Formal Footwear', family: 'men', isActive: true }
    });
    console.log(`✓ Created: ${menFormalSubfamily.name} (Men)`);

    const menCasualSubfamily = await prisma.subfamily.create({
      data: { name: 'Casual Footwear', family: 'men', isActive: true }
    });
    console.log(`✓ Created: ${menCasualSubfamily.name} (Men)`);

    const menAccessoriesSubfamily = await prisma.subfamily.create({
      data: { name: 'Accessories', family: 'men', isActive: true }
    });
    console.log(`✓ Created: ${menAccessoriesSubfamily.name} (Men)\n`);

    // Create default subfamilies for Women
    console.log('Creating subfamilies for Women...');
    const womenFormalSubfamily = await prisma.subfamily.create({
      data: { name: 'Formal Footwear', family: 'women', isActive: true }
    });
    console.log(`✓ Created: ${womenFormalSubfamily.name} (Women)`);

    const womenCasualSubfamily = await prisma.subfamily.create({
      data: { name: 'Casual Footwear', family: 'women', isActive: true }
    });
    console.log(`✓ Created: ${womenCasualSubfamily.name} (Women)`);

    const womenAccessoriesSubfamily = await prisma.subfamily.create({
      data: { name: 'Accessories', family: 'women', isActive: true }
    });
    console.log(`✓ Created: ${womenAccessoriesSubfamily.name} (Women)\n`);

    // Get all categories
    const categories = await prisma.category.findMany();
    console.log(`Found ${categories.length} categories to migrate\n`);

    // Assign categories to subfamilies based on their name and current family
    const categoryMapping = {
      'Formal Shoes': menFormalSubfamily.id,
      'Loafers': menCasualSubfamily.id,
      'Boots': menCasualSubfamily.id,
      'Sneakers': menCasualSubfamily.id,
      'Accessories': menAccessoriesSubfamily.id
    };

    for (const category of categories) {
      // Remove the family field and add subfamilyId
      const subfamilyId = categoryMapping[category.name] || menCasualSubfamily.id;
      
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

    console.log('\n✅ Successfully migrated all categories to subfamilies!');
    console.log('\nSubfamily Structure:');
    console.log('Men:');
    console.log('  - Formal Footwear');
    console.log('  - Casual Footwear');
    console.log('  - Accessories');
    console.log('Women:');
    console.log('  - Formal Footwear');
    console.log('  - Casual Footwear');
    console.log('  - Accessories\n');

  } catch (error) {
    console.error('Error migrating to subfamilies:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateToSubfamilies();
