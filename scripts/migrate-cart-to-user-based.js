const prisma = require('../src/lib/prisma')

async function main() {
  console.log('🔄 Migrating cart items to user-based structure...')

  try {
    // Get the first admin user (will assign old cart items to them)
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (!adminUser) {
      console.log('⚠️  No admin user found. Creating a default admin...')
      // You might want to handle this differently
      console.log('Please create an admin user first before running this migration')
      return
    }

    // Check if there are any old cart items without userId
    const oldCartCount = await prisma.cartItem.countDocuments({
      userId: { $exists: false }
    })

    if (oldCartCount > 0) {
      console.log(`Found ${oldCartCount} cart items without userId. Assigning to admin user...`)
      
      // Update all cart items without userId to assign them to admin
      const result = await prisma.cartItem.updateMany({
        where: { userId: null },
        data: { userId: adminUser.id }
      })
      
      console.log(`✅ Updated ${result.modifiedCount} cart items`)
    } else {
      console.log('✅ All cart items already have userId assigned')
    }

    console.log('🎉 Migration complete!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
