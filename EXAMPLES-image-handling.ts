/*
Example: If you want multiple images per product

1. Update your Prisma schema (prisma/schema.prisma):

model Product {
  id              String        @id @default(auto()) @map("_id") @db.ObjectId
  name            String
  description     String
  price           Float
  image           String        // Main image URL
  images          String[]      // Array of image URLs for gallery
  categoryId      String        @db.ObjectId
  // ... rest of your fields
}

2. Then use like this:
*/

export async function exampleMultipleImages() {
  const prisma = {} as any; // Placeholder
  
  const product = await prisma.product.create({
    data: {
      name: "Running Shoes",
      image: "https://cloudinary.com/main-image.jpg",
      images: [
        "https://cloudinary.com/view1.jpg",
        "https://cloudinary.com/view2.jpg",
        "https://cloudinary.com/view3.jpg"
      ],
      // ... other fields
    }
  })
  
  return product;
}
