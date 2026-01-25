const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addFamilyToCategories() {
  try {
    console.log('Starting to add family field to categories...\n');

    // Get all categories
    const categories = await prisma.category.findMany();
    console.log(`Found ${categories.length} categories\n`);

    // Define family mappings
    // For shoes, we'll create both men's and women's versions
    const familyMapping = {
      'Formal Shoes': 'men',
      'Loafers': 'men',
      'Boots': 'men',
      'Sneakers': 'men',
      'Accessories': 'men'
    };

    // Update each category
    for (const category of categories) {
      const family = familyMapping[category.name] || 'men';
      
      await prisma.category.update({
        where: { id: category.id },
        data: { family }
      });
      
      console.log(`✓ Updated "${category.name}" with family: ${family}`);
    }

    console.log('\n✅ Successfully updated all categories with family field!');
    console.log('\nNote: All categories are currently set to "men".');
    console.log('You can create women\'s versions through the admin panel.\n');

  } catch (error) {
    console.error('Error adding family to categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addFamilyToCategories();
