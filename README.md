# ClassyChain - Premium Shoe E-Commerce Store

A modern, full-stack e-commerce application for selling premium shoes built with Next.js 15, TypeScript, Prisma, and Tailwind CSS.

## Features

### Frontend
- **Home Page**: Hero banner with category navigation
- **Product Catalog**: Browse all shoes with filtering by category
- **Product Details**: View detailed product information with reviews
- **Shopping Cart**: Add, remove, and update product quantities
- **Checkout**: Complete purchase flow with shipping details
- **User Authentication**: Login and registration
- **User Profile**: View and edit profile information
- **Wishlist**: Save favorite products (placeholder)

### Backend API Routes
- **Products API**: GET (list/filter), POST (create), GET/:id, PUT/:id, DELETE/:id
- **Cart API**: GET, POST, DELETE/:id, PUT/:id
- **Orders API**: POST (create), GET (list by user)
- **Auth API**: POST /register, POST /login
- **Users API**: GET/:id, PUT/:id
- **Reviews API**: GET, POST

### Database
- **SQLite** with Prisma ORM
- Models: User, Product, Order, OrderItem, CartItem, Review

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT
- **UI Icons**: Lucide React
- **State Management**: Client-side React hooks
- **API**: Next.js API Routes

## Getting Started

### Prerequisites
- Node.js 20.9.0 or higher
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma db push
```

3. Seed sample data:
```bash
npm run db:seed
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed sample data

## Project Structure

```
classychain/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── cart/
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   ├── reviews/
│   │   │   └── users/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── login/
│   │   ├── register/
│   │   ├── profile/
│   │   ├── wishlist/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── Providers.tsx
│   └── styles/
│       └── globals.css
├── prisma/
│   ├── schema.prisma
│   └── dev.db (generated)
├── scripts/
│   └── seed.js
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
└── postcss.config.js
```

## Database Schema

### User
- id, email, password, name, phone, address, city, state, zipCode, country
- Relations: orders, reviews

### Product
- id, name, description, price, image, category, size, brand, stock, rating
- Relations: orderItems, reviews, cartItems

### Order
- id, userId, totalPrice, status, paymentId, shippingAddress
- Relations: items (OrderItem), user

### OrderItem
- id, orderId, productId, quantity, price
- Relations: order, product

### CartItem
- id, productId, quantity
- Relations: product

### Review
- id, userId, productId, rating, comment
- Relations: user, product

## Environment Variables

Create a `.env.local` file:

```
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
JWT_SECRET="your_jwt_secret_key_here_change_in_production"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_your_stripe_public_key"
```

## Features to Add

- [ ] Payment integration with Stripe
- [ ] Email notifications
- [ ] Advanced search and filtering
- [ ] Product recommendations
- [ ] Admin dashboard
- [ ] Order tracking
- [ ] Product image uploads
- [ ] Customer reviews and ratings
- [ ] Social login
- [ ] Multi-language support

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
