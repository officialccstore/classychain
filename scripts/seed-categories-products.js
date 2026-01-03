const prisma = require('../src/lib/prisma')

async function main() {
  console.log('🌱 Seeding categories, subcategories, and products...')

  // Clear existing data
  await prisma.cartItem.deleteMany({})
  await prisma.sizeVariant.deleteMany({})
  await prisma.product.deleteMany({})
  await prisma.subcategory.deleteMany({})
  await prisma.category.deleteMany({})

  // Create categories
  const categories = {
    formal: await prisma.category.create({
      data: { name: 'Formal Shoes', isActive: true }
    }),
    loafers: await prisma.category.create({
      data: { name: 'Loafers', isActive: true }
    }),
    boots: await prisma.category.create({
      data: { name: 'Boots', isActive: true }
    }),
    sneakers: await prisma.category.create({
      data: { name: 'Sneakers', isActive: true }
    }),
    accessories: await prisma.category.create({
      data: { name: 'Accessories', isActive: true }
    })
  }

  console.log('✅ Categories created')

  // Create subcategories
  const subcategories = {
    // Formal Shoes (1)
    oxford: await prisma.subcategory.create({
      data: { categoryId: categories.formal.id, name: 'Oxford', isActive: true }
    }),
    derby: await prisma.subcategory.create({
      data: { categoryId: categories.formal.id, name: 'Derby', isActive: true }
    }),
    brogue: await prisma.subcategory.create({
      data: { categoryId: categories.formal.id, name: 'Brogue', isActive: true }
    }),
    wholeCut: await prisma.subcategory.create({
      data: { categoryId: categories.formal.id, name: 'Whole Cut', isActive: true }
    }),
    // Loafers (2)
    pennyLoafers: await prisma.subcategory.create({
      data: { categoryId: categories.loafers.id, name: 'Penny Loafers', isActive: true }
    }),
    monkStrap: await prisma.subcategory.create({
      data: { categoryId: categories.loafers.id, name: 'Monk Strap Loafers', isActive: true }
    }),
    drivingLoafers: await prisma.subcategory.create({
      data: { categoryId: categories.loafers.id, name: 'Driving Loafers', isActive: true }
    }),
    tasselLoafers: await prisma.subcategory.create({
      data: { categoryId: categories.loafers.id, name: 'Tassel Loafers', isActive: true }
    }),
    // Boots (3)
    chelseaBoots: await prisma.subcategory.create({
      data: { categoryId: categories.boots.id, name: 'Chelsea Boots', isActive: true }
    }),
    ankleBoots: await prisma.subcategory.create({
      data: { categoryId: categories.boots.id, name: 'Ankle Length Boots', isActive: true }
    }),
    elasticSide: await prisma.subcategory.create({
      data: { categoryId: categories.boots.id, name: 'Elastic Side Boots', isActive: true }
    }),
    elasticZip: await prisma.subcategory.create({
      data: { categoryId: categories.boots.id, name: 'Elastic with Zip Boots', isActive: true }
    }),
    partyBoots: await prisma.subcategory.create({
      data: { categoryId: categories.boots.id, name: 'Premium Party Wear Boots', isActive: true }
    }),
    cubanHeelBoots: await prisma.subcategory.create({
      data: { categoryId: categories.boots.id, name: 'Cuban Heel Boots', isActive: true }
    }),
    // Sneakers (4) - No subcategories by design
    // Accessories (5)
    bag: await prisma.subcategory.create({
      data: { categoryId: categories.accessories.id, name: 'Bag', isActive: true }
    }),
    belt: await prisma.subcategory.create({
      data: { categoryId: categories.accessories.id, name: 'Belt', isActive: true }
    }),
    wallet: await prisma.subcategory.create({
      data: { categoryId: categories.accessories.id, name: 'Wallet', isActive: true }
    }),
    perfume: await prisma.subcategory.create({
      data: { categoryId: categories.accessories.id, name: 'Perfume', isActive: true }
    })
  }

  console.log('✅ Subcategories created')

  // Helper function to create product with size variants
  async function createProductWithSizes(data) {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        brand: data.brand,
        rating: data.rating,
        sizeVariants: {
          create: data.sizes
        }
      },
      include: { sizeVariants: true }
    })
    return product
  }

  const sizes = ['6', '7', '8', '9', '10', '11', '12', '13']
  const sizeConfig = (qty) => sizes.map((size, idx) => ({
    size,
    quantity: qty > 0 ? Math.floor(Math.random() * qty) + 1 : 0
  }))

  // ========== FORMAL SHOES ==========

  // Oxford
  await createProductWithSizes({
    name: 'Classic Black Oxford',
    description: 'Timeless black leather oxford perfect for formal occasions',
    price: 249.99,
    image: '👞',
    categoryId: categories.formal.id,
    subcategoryId: subcategories.oxford.id,
    brand: 'Allen Edmonds',
    rating: 4.7,
    sizes: sizeConfig(15)
  })

  await createProductWithSizes({
    name: 'Brown Oxford Leather',
    description: 'Premium brown leather oxford with elegant stitching',
    price: 279.99,
    image: '👞',
    categoryId: categories.formal.id,
    subcategoryId: subcategories.oxford.id,
    brand: 'Cole Haan',
    rating: 4.6,
    sizes: sizeConfig(12)
  })

  await createProductWithSizes({
    name: 'Burgundy Oxford Dress',
    description: 'Deep burgundy oxford for sophisticated formal wear',
    price: 259.99,
    image: '👞',
    categoryId: categories.formal.id,
    subcategoryId: subcategories.oxford.id,
    brand: 'Johnston Murphy',
    rating: 4.8,
    sizes: sizeConfig(10)
  })

  // Derby
  await createProductWithSizes({
    name: 'Black Leather Derby',
    description: 'Classic black leather derby with open lacing',
    price: 229.99,
    image: '👞',
    categoryId: categories.formal.id,
    subcategoryId: subcategories.derby.id,
    brand: 'Clarks',
    rating: 4.5,
    sizes: sizeConfig(14)
  })

  await createProductWithSizes({
    name: 'Tan Derby Shoes',
    description: 'Tan leather derby perfect for business casual',
    price: 239.99,
    image: '👞',
    categoryId: categories.formal.id,
    subcategoryId: subcategories.derby.id,
    brand: 'Bostonian',
    rating: 4.4,
    sizes: sizeConfig(13)
  })

  await createProductWithSizes({
    name: 'Charcoal Derby Loafer',
    description: 'Modern charcoal derby for contemporary formal style',
    price: 269.99,
    image: '👞',
    categoryId: categories.formal.id,
    subcategoryId: subcategories.derby.id,
    brand: 'Florsheim',
    rating: 4.6,
    sizes: sizeConfig(11)
  })

  // Brogue
  await createProductWithSizes({
    name: 'Wingtip Brogue Oxford',
    description: 'Classic wingtip brogue with detailed perforations',
    price: 289.99,
    image: '👞',
    categoryId: categories.formal.id,
    subcategoryId: subcategories.brogue.id,
    brand: 'Allen Edmonds',
    rating: 4.8,
    sizes: sizeConfig(12)
  })

  await createProductWithSizes({
    name: 'Full Brogue Derby',
    description: 'Full brogue with intricate wing cap design',
    price: 299.99,
    image: '👞',
    categoryId: categories.formal.id,
    subcategoryId: subcategories.brogue.id,
    brand: 'Johnston Murphy',
    rating: 4.7,
    sizes: sizeConfig(10)
  })

  await createProductWithSizes({
    name: 'Semi Brogue Shoes',
    description: 'Semi brogue with subtle perforations and styling',
    price: 259.99,
    image: '👞',
    categoryId: categories.formal.id,
    subcategoryId: subcategories.brogue.id,
    brand: 'Cole Haan',
    rating: 4.5,
    sizes: sizeConfig(13)
  })

  // Whole Cut
  await createProductWithSizes({
    name: 'Premium Whole Cut Black',
    description: 'Elegant whole cut shoe with seamless single leather piece',
    price: 349.99,
    image: '👞',
    categoryId: categories.formal.id,
    subcategoryId: subcategories.wholeCut.id,
    brand: 'Allen Edmonds',
    rating: 4.9,
    sizes: sizeConfig(8)
  })

  await createProductWithSizes({
    name: 'Whole Cut Brown Oxford',
    description: 'Sophisticated brown whole cut for the executive',
    price: 359.99,
    image: '👞',
    categoryId: categories.formal.id,
    subcategoryId: subcategories.wholeCut.id,
    brand: 'Johnston Murphy',
    rating: 4.8,
    sizes: sizeConfig(9)
  })

  await createProductWithSizes({
    name: 'Glossy Whole Cut Derby',
    description: 'High-shine whole cut derby for special occasions',
    price: 369.99,
    image: '👞',
    categoryId: categories.formal.id,
    subcategoryId: subcategories.wholeCut.id,
    brand: 'Cole Haan',
    rating: 4.7,
    sizes: sizeConfig(7)
  })

  // ========== LOAFERS ==========

  // Penny Loafers
  await createProductWithSizes({
    name: 'Classic Penny Loafer',
    description: 'Traditional penny loafer in smooth leather',
    price: 189.99,
    image: '👞',
    categoryId: categories.loafers.id,
    subcategoryId: subcategories.pennyLoafers.id,
    brand: 'G.H. Bass',
    rating: 4.6,
    sizes: sizeConfig(15)
  })

  await createProductWithSizes({
    name: 'Suede Penny Loafer',
    description: 'Comfortable suede penny loafer for casual elegance',
    price: 199.99,
    image: '👞',
    categoryId: categories.loafers.id,
    subcategoryId: subcategories.pennyLoafers.id,
    brand: 'Sebago',
    rating: 4.7,
    sizes: sizeConfig(14)
  })

  await createProductWithSizes({
    name: 'Leather Penny Loafer',
    description: 'Premium leather penny loafer with cushioned insole',
    price: 219.99,
    image: '👞',
    categoryId: categories.loafers.id,
    subcategoryId: subcategories.pennyLoafers.id,
    brand: 'Cole Haan',
    rating: 4.8,
    sizes: sizeConfig(12)
  })

  // Monk Strap
  await createProductWithSizes({
    name: 'Single Monk Strap Black',
    description: 'Single monk strap in sleek black leather',
    price: 229.99,
    image: '👞',
    categoryId: categories.loafers.id,
    subcategoryId: subcategories.monkStrap.id,
    brand: 'Allen Edmonds',
    rating: 4.7,
    sizes: sizeConfig(13)
  })

  await createProductWithSizes({
    name: 'Double Monk Strap Brown',
    description: 'Double monk strap in rich brown leather',
    price: 249.99,
    image: '👞',
    categoryId: categories.loafers.id,
    subcategoryId: subcategories.monkStrap.id,
    brand: 'Johnston Murphy',
    rating: 4.8,
    sizes: sizeConfig(11)
  })

  await createProductWithSizes({
    name: 'Suede Monk Strap Tan',
    description: 'Comfortable suede monk strap in warm tan',
    price: 239.99,
    image: '👞',
    categoryId: categories.loafers.id,
    subcategoryId: subcategories.monkStrap.id,
    brand: 'Clarks',
    rating: 4.6,
    sizes: sizeConfig(14)
  })

  // Driving Loafers
  await createProductWithSizes({
    name: 'Driving Moccasin Black',
    description: 'Flexible driving loafer with rubber sole for grip',
    price: 179.99,
    image: '👞',
    categoryId: categories.loafers.id,
    subcategoryId: subcategories.drivingLoafers.id,
    brand: 'Sebago',
    rating: 4.5,
    sizes: sizeConfig(16)
  })

  await createProductWithSizes({
    name: 'Driving Loafer Brown',
    description: 'Comfortable driving loafer for everyday use',
    price: 189.99,
    image: '👞',
    categoryId: categories.loafers.id,
    subcategoryId: subcategories.drivingLoafers.id,
    brand: 'Cole Haan',
    rating: 4.6,
    sizes: sizeConfig(15)
  })

  await createProductWithSizes({
    name: 'Suede Driving Moccasin',
    description: 'Premium suede driving loafer for comfort',
    price: 199.99,
    image: '👞',
    categoryId: categories.loafers.id,
    subcategoryId: subcategories.drivingLoafers.id,
    brand: 'Bostonian',
    rating: 4.7,
    sizes: sizeConfig(14)
  })

  // Tassel Loafers
  await createProductWithSizes({
    name: 'Black Tassel Loafer',
    description: 'Elegant black leather tassel loafer',
    price: 219.99,
    image: '👞',
    categoryId: categories.loafers.id,
    subcategoryId: subcategories.tasselLoafers.id,
    brand: 'Allen Edmonds',
    rating: 4.8,
    sizes: sizeConfig(12)
  })

  await createProductWithSizes({
    name: 'Burgundy Tassel Loafer',
    description: 'Rich burgundy tassel loafer for style',
    price: 229.99,
    image: '👞',
    categoryId: categories.loafers.id,
    subcategoryId: subcategories.tasselLoafers.id,
    brand: 'Johnston Murphy',
    rating: 4.7,
    sizes: sizeConfig(13)
  })

  await createProductWithSizes({
    name: 'Navy Tassel Loafer',
    description: 'Classic navy tassel loafer with comfort lining',
    price: 239.99,
    image: '👞',
    categoryId: categories.loafers.id,
    subcategoryId: subcategories.tasselLoafers.id,
    brand: 'Clarks',
    rating: 4.6,
    sizes: sizeConfig(14)
  })

  // ========== BOOTS ==========

  // Chelsea Boots
  await createProductWithSizes({
    name: 'Black Chelsea Boot',
    description: 'Classic black leather chelsea boot for all occasions',
    price: 269.99,
    image: '👢',
    categoryId: categories.boots.id,
    subcategoryId: subcategories.chelseaBoots.id,
    brand: 'Oliver Sweeney',
    rating: 4.7,
    sizes: sizeConfig(12)
  })

  await createProductWithSizes({
    name: 'Brown Chelsea Boot',
    description: 'Rich brown leather chelsea boot with elastic sides',
    price: 279.99,
    image: '👢',
    categoryId: categories.boots.id,
    subcategoryId: subcategories.chelseaBoots.id,
    brand: 'Crockett Jones',
    rating: 4.8,
    sizes: sizeConfig(11)
  })

  await createProductWithSizes({
    name: 'Tan Suede Chelsea',
    description: 'Premium tan suede chelsea boot for elegance',
    price: 289.99,
    image: '👢',
    categoryId: categories.boots.id,
    subcategoryId: subcategories.chelseaBoots.id,
    brand: 'Allen Edmonds',
    rating: 4.9,
    sizes: sizeConfig(10)
  })

  // Ankle Length Boots
  await createProductWithSizes({
    name: 'Black Ankle Boot',
    description: 'Sleek black ankle boot for contemporary style',
    price: 239.99,
    image: '👢',
    categoryId: categories.boots.id,
    subcategoryId: subcategories.ankleBoots.id,
    brand: 'Clarks',
    rating: 4.6,
    sizes: sizeConfig(13)
  })

  await createProductWithSizes({
    name: 'Charcoal Ankle Boot',
    description: 'Sophisticated charcoal ankle boot for versatility',
    price: 249.99,
    image: '👢',
    categoryId: categories.boots.id,
    subcategoryId: subcategories.ankleBoots.id,
    brand: 'Bostonian',
    rating: 4.7,
    sizes: sizeConfig(12)
  })

  await createProductWithSizes({
    name: 'Brown Leather Ankle Boot',
    description: 'Premium brown leather ankle boot with comfort sole',
    price: 259.99,
    image: '👢',
    categoryId: categories.boots.id,
    subcategoryId: subcategories.ankleBoots.id,
    brand: 'Cole Haan',
    rating: 4.8,
    sizes: sizeConfig(11)
  })

  // Elastic Side Boots
  await createProductWithSizes({
    name: 'Black Elastic Side Boot',
    description: 'Classic black elastic side boot for easy wear',
    price: 249.99,
    image: '👢',
    categoryId: categories.boots.id,
    subcategoryId: subcategories.elasticSide.id,
    brand: 'Allen Edmonds',
    rating: 4.7,
    sizes: sizeConfig(12)
  })

  await createProductWithSizes({
    name: 'Brown Elastic Side Boot',
    description: 'Rich brown elastic side boot for comfort and style',
    price: 259.99,
    image: '👢',
    categoryId: categories.boots.id,
    subcategoryId: subcategories.elasticSide.id,
    brand: 'Johnston Murphy',
    rating: 4.8,
    sizes: sizeConfig(11)
  })

  await createProductWithSizes({
    name: 'Burgundy Elastic Side Boot',
    description: 'Elegant burgundy elastic side boot',
    price: 269.99,
    image: '👢',
    categoryId: categories.boots.id,
    subcategoryId: subcategories.elasticSide.id,
    brand: 'Oliver Sweeney',
    rating: 4.6,
    sizes: sizeConfig(10)
  })

  // Elastic with Zip Boots
  await createProductWithSizes({
    name: 'Black Zip Boot',
    description: 'Convenient black elastic boot with side zip',
    price: 279.99,
    image: '👢',
    categoryId: categories.boots.id,
    subcategoryId: subcategories.elasticZip.id,
    brand: 'Clarks',
    rating: 4.7,
    sizes: sizeConfig(11)
  })

  await createProductWithSizes({
    name: 'Brown Zip Boot',
    description: 'Functional brown elastic boot with easy zip access',
    price: 289.99,
    image: '👢',
    categoryId: categories.boots.id,
    subcategoryId: subcategories.elasticZip.id,
    brand: 'Cole Haan',
    rating: 4.8,
    sizes: sizeConfig(10)
  })

  await createProductWithSizes({
    name: 'Tan Zip Boot',
    description: 'Premium tan leather boot with convenient zipper',
    price: 299.99,
    image: '👢',
    categoryId: categories.boots.id,
    subcategoryId: subcategories.elasticZip.id,
    brand: 'Bostonian',
    rating: 4.9,
    sizes: sizeConfig(9)
  })

  // Premium Party Wear Boots
  await createProductWithSizes({
    name: 'Black Party Wear Boot',
    description: 'Luxurious black boot for formal events and parties',
    price: 349.99,
    image: '👢',
    categoryId: categories.boots.id,
    subcategoryId: subcategories.partyBoots.id,
    brand: 'Allen Edmonds',
    rating: 4.9,
    sizes: sizeConfig(8)
  })

  await createProductWithSizes({
    name: 'Burgundy Party Boot',
    description: 'Elegant burgundy premium boot for sophisticated events',
    price: 359.99,
    image: '👢',
    categoryId: categories.boots.id,
    subcategoryId: subcategories.partyBoots.id,
    brand: 'Johnston Murphy',
    rating: 4.8,
    sizes: sizeConfig(7)
  })

  await createProductWithSizes({
    name: 'Charcoal Premium Boot',
    description: 'Refined charcoal premium boot with high-end finish',
    price: 369.99,
    image: '👢',
    categoryId: categories.boots.id,
    subcategoryId: subcategories.partyBoots.id,
    brand: 'Oliver Sweeney',
    rating: 4.9,
    sizes: sizeConfig(6)
  })

  // Cuban Heel Boots
  await createProductWithSizes({
    name: 'Black Cuban Heel Boot',
    description: 'Stylish black boot with distinctive Cuban heel',
    price: 289.99,
    image: '👢',
    categoryId: categories.boots.id,
    subcategoryId: subcategories.cubanHeelBoots.id,
    brand: 'Clarks',
    rating: 4.6,
    sizes: sizeConfig(10)
  })

  await createProductWithSizes({
    name: 'Brown Cuban Heel Boot',
    description: 'Classic brown boot with comfortable Cuban heel',
    price: 299.99,
    image: '👢',
    categoryId: categories.boots.id,
    subcategoryId: subcategories.cubanHeelBoots.id,
    brand: 'Bostonian',
    rating: 4.7,
    sizes: sizeConfig(11)
  })

  await createProductWithSizes({
    name: 'Cognac Cuban Heel Boot',
    description: 'Premium cognac leather boot with Cuban heel styling',
    price: 309.99,
    image: '👢',
    categoryId: categories.boots.id,
    subcategoryId: subcategories.cubanHeelBoots.id,
    brand: 'Cole Haan',
    rating: 4.8,
    sizes: sizeConfig(9)
  })

  // ========== SNEAKERS (No subcategories) ==========

  await createProductWithSizes({
    name: 'Air Max 90 Premium',
    description: 'Classic Air Max 90 with modern comfort technology',
    price: 139.99,
    image: '👟',
    categoryId: categories.sneakers.id,
    subcategoryId: null,
    brand: 'Nike',
    rating: 4.7,
    sizes: sizeConfig(15)
  })

  await createProductWithSizes({
    name: 'Stan Smith Adidas',
    description: 'Timeless Adidas Stan Smith sneaker',
    price: 99.99,
    image: '👟',
    categoryId: categories.sneakers.id,
    subcategoryId: null,
    brand: 'Adidas',
    rating: 4.6,
    sizes: sizeConfig(16)
  })

  await createProductWithSizes({
    name: 'Jordan 1 Retro',
    description: 'Iconic Jordan 1 Retro High OG',
    price: 189.99,
    image: '👟',
    categoryId: categories.sneakers.id,
    subcategoryId: null,
    brand: 'Jordan',
    rating: 4.8,
    sizes: sizeConfig(14)
  })

  // ========== ACCESSORIES ==========

  // Bags
  await createProductWithSizes({
    name: 'Premium Leather Shoe Bag',
    description: 'Elegant leather storage bag for shoe protection',
    price: 49.99,
    image: '👜',
    categoryId: categories.accessories.id,
    subcategoryId: subcategories.bag.id,
    brand: 'Classic',
    rating: 4.5,
    sizes: [{ size: 'One Size', quantity: 30 }]
  })

  await createProductWithSizes({
    name: 'Travel Shoe Organizer Bag',
    description: 'Spacious bag for organizing and transporting shoes',
    price: 39.99,
    image: '👜',
    categoryId: categories.accessories.id,
    subcategoryId: subcategories.bag.id,
    brand: 'TravelPro',
    rating: 4.6,
    sizes: [{ size: 'One Size', quantity: 25 }]
  })

  await createProductWithSizes({
    name: 'Luxury Dust Bag',
    description: 'Premium dust bag with premium material for storage',
    price: 29.99,
    image: '👜',
    categoryId: categories.accessories.id,
    subcategoryId: subcategories.bag.id,
    brand: 'Luxury',
    rating: 4.7,
    sizes: [{ size: 'One Size', quantity: 40 }]
  })

  // Belts
  await createProductWithSizes({
    name: 'Black Leather Belt Premium',
    description: 'Premium black leather belt for formal and casual wear',
    price: 79.99,
    image: '🎀',
    categoryId: categories.accessories.id,
    subcategoryId: subcategories.belt.id,
    brand: 'Allen Edmonds',
    rating: 4.8,
    sizes: [
      { size: '30', quantity: 5 },
      { size: '32', quantity: 8 },
      { size: '34', quantity: 12 },
      { size: '36', quantity: 10 },
      { size: '38', quantity: 8 },
      { size: '40', quantity: 5 }
    ]
  })

  await createProductWithSizes({
    name: 'Brown Leather Belt',
    description: 'Classic brown leather belt for everyday use',
    price: 69.99,
    image: '🎀',
    categoryId: categories.accessories.id,
    subcategoryId: subcategories.belt.id,
    brand: 'Cole Haan',
    rating: 4.7,
    sizes: [
      { size: '30', quantity: 6 },
      { size: '32', quantity: 9 },
      { size: '34', quantity: 11 },
      { size: '36', quantity: 9 },
      { size: '38', quantity: 7 },
      { size: '40', quantity: 4 }
    ]
  })

  await createProductWithSizes({
    name: 'Cognac Leather Belt',
    description: 'Rich cognac leather belt for sophisticated style',
    price: 74.99,
    image: '🎀',
    categoryId: categories.accessories.id,
    subcategoryId: subcategories.belt.id,
    brand: 'Johnston Murphy',
    rating: 4.6,
    sizes: [
      { size: '30', quantity: 4 },
      { size: '32', quantity: 7 },
      { size: '34', quantity: 10 },
      { size: '36', quantity: 8 },
      { size: '38', quantity: 6 },
      { size: '40', quantity: 3 }
    ]
  })

  // Wallets
  await createProductWithSizes({
    name: 'Black Leather Wallet',
    description: 'Premium black leather wallet with RFID protection',
    price: 99.99,
    image: '👝',
    categoryId: categories.accessories.id,
    subcategoryId: subcategories.wallet.id,
    brand: 'Allen Edmonds',
    rating: 4.8,
    sizes: [{ size: 'One Size', quantity: 20 }]
  })

  await createProductWithSizes({
    name: 'Brown Leather Wallet',
    description: 'Classic brown leather wallet with multiple card slots',
    price: 89.99,
    image: '👝',
    categoryId: categories.accessories.id,
    subcategoryId: subcategories.wallet.id,
    brand: 'Cole Haan',
    rating: 4.7,
    sizes: [{ size: 'One Size', quantity: 25 }]
  })

  await createProductWithSizes({
    name: 'Bifold Leather Wallet',
    description: 'Sleek bifold wallet in premium leather',
    price: 79.99,
    image: '👝',
    categoryId: categories.accessories.id,
    subcategoryId: subcategories.wallet.id,
    brand: 'Bostonian',
    rating: 4.6,
    sizes: [{ size: 'One Size', quantity: 30 }]
  })

  // Perfumes
  await createProductWithSizes({
    name: 'Classic Cologne',
    description: 'Timeless classic cologne for everyday wear',
    price: 59.99,
    image: '💐',
    categoryId: categories.accessories.id,
    subcategoryId: subcategories.perfume.id,
    brand: 'Classics',
    rating: 4.5,
    sizes: [{ size: '3.4 fl oz', quantity: 35 }]
  })

  await createProductWithSizes({
    name: 'Premium Fragrance',
    description: 'Sophisticated premium fragrance for special occasions',
    price: 89.99,
    image: '💐',
    categoryId: categories.accessories.id,
    subcategoryId: subcategories.perfume.id,
    brand: 'Premium',
    rating: 4.7,
    sizes: [{ size: '3.4 fl oz', quantity: 20 }]
  })

  await createProductWithSizes({
    name: 'Luxury Eau de Parfum',
    description: 'Luxurious eau de parfum with lasting fragrance',
    price: 129.99,
    image: '💐',
    categoryId: categories.accessories.id,
    subcategoryId: subcategories.perfume.id,
    brand: 'Luxury',
    rating: 4.8,
    sizes: [{ size: '3.4 fl oz', quantity: 15 }]
  })

  console.log('✅ All products with sizes created successfully!')
  console.log(`Total products: ${5 + 4 + 6 + 3 + 3} = ${5 + 4 + 6 + 3 + 3} products`)
}

main().catch(console.error).finally(() => process.exit())
