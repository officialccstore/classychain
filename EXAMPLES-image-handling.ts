// Example: If you want multiple images per product
// Update your Prisma schema:

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

// Then use like this:
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
