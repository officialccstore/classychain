const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample products
  const products = [
    {
      name: 'Air Max 90',
      description: 'Classic Nike Air Max 90 with modern comfort',
      price: 129.99,
      image: '/images/air-max-90.jpg',
      category: 'Running',
      size: '10',
      brand: 'Nike',
      stock: 50,
      rating: 4.5,
    },
    {
      name: 'Stan Smith',
      description: 'Timeless Adidas Stan Smith sneaker',
      price: 89.99,
      image: '/images/stan-smith.jpg',
      category: 'Casual',
      size: '10',
      brand: 'Adidas',
      stock: 60,
      rating: 4.3,
    },
    {
      name: 'Jordan 1 Retro',
      description: 'Iconic Jordan 1 Retro High OG',
      price: 179.99,
      image: '/images/jordan-1.jpg',
      category: 'Casual',
      size: '10',
      brand: 'Jordan',
      stock: 30,
      rating: 4.8,
    },
    {
      name: 'Ultraboost 23',
      description: 'Latest Adidas Ultraboost running shoe',
      price: 199.99,
      image: '/images/ultraboost.jpg',
      category: 'Running',
      size: '10',
      brand: 'Adidas',
      stock: 40,
      rating: 4.6,
    },
    {
      name: 'Oxford Classic',
      description: 'Premium leather oxford dress shoe',
      price: 249.99,
      image: '/images/oxford.jpg',
      category: 'Formal',
      size: '10',
      brand: 'Cole Haan',
      stock: 20,
      rating: 4.4,
    },
    {
      name: 'Vaporfly Next',
      description: 'Nike race day running shoe',
      price: 275.00,
      image: '/images/vaporfly.jpg',
      category: 'Running',
      size: '10',
      brand: 'Nike',
      stock: 15,
      rating: 4.9,
    },
    {
      name: 'New Balance 990v6',
      description: 'Comfortable everyday sneaker',
      price: 184.99,
      image: '/images/nb-990.jpg',
      category: 'Casual',
      size: '10',
      brand: 'New Balance',
      stock: 45,
      rating: 4.2,
    },
    {
      name: 'Yeezy 350',
      description: 'Kanye West Adidas Yeezy 350 V2',
      price: 220.00,
      image: '/images/yeezy.jpg',
      category: 'Casual',
      size: '10',
      brand: 'Adidas',
      stock: 25,
      rating: 4.7,
    },
  ]

  const existingProducts = await prisma.product.findMany()
  
  if (existingProducts.length === 0) {
    for (const product of products) {
      await prisma.product.create({
        data: product,
      })
    }
    console.log('✅ Database seeded with 8 products!')
  } else {
    console.log('✅ Database already has products, skipping seed!')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
