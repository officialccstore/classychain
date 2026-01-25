# Subfamily Implementation Summary

## Overview
Successfully implemented a hierarchical product organization system with **Family → Subfamily → Category → Subcategory** structure.

## Hierarchy Structure

```
Family (Men/Women)
  └── Subfamily (Footwear, Bags & Accessories)
      └── Category (Boots, Sneakers, etc.)
          └── Subcategory (Oxford, Derby, etc.)
              └── Products
```

## Database Structure

### Current Subfamilies in Database
- **Men**
  - Footwear (ID: 6975cd4ee64a0518ea47c8fe)
  - Bags & Accessories (ID: 6975cd4fe64a0518ea47c8ff)
  
- **Women**
  - Footwear (ID: 6975cd4fe64a0518ea47c900)
  - Bags & Accessories (ID: 6975cd4fe64a0518ea47c901)

### Current Categories Assignment
All 5 categories assigned to Men's subfamilies:
- Formal Shoes → Men's Footwear
- Loafers → Men's Footwear
- Boots → Men's Footwear
- Sneakers → Men's Footwear
- Accessories → Men's Bags & Accessories

## Implementation Details

### 1. Schema Changes (`prisma/schema.prisma`)
```prisma
model Subfamily {
  id         String     @id @default(auto()) @map("_id") @db.ObjectId
  name       String
  family     String     // 'men' or 'women'
  isActive   Boolean    @default(true)
  categories Category[]
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
}

model Category {
  id           String        @id @default(auto()) @map("_id") @db.ObjectId
  name         String
  subfamilyId  String?       @db.ObjectId
  subfamily    Subfamily?    @relation(fields: [subfamilyId], references: [id], onDelete: SetNull)
  isActive     Boolean       @default(true)
  subcategories Subcategory[]
  products     Product[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}
```

### 2. API Routes Created

#### `/api/subfamilies` (GET & POST)
- **GET**: Fetch all subfamilies with optional `family` filter
  - Returns subfamilies with their categories
  - No isActive filter in admin view
  
- **POST**: Create new subfamily
  - Required: `name`, `family` ('men' or 'women')
  - Optional: `isActive` (default: true)

#### `/api/subfamilies/[id]` (GET, PUT, DELETE)
- **GET**: Fetch single subfamily with categories
- **PUT**: Update subfamily details
- **DELETE**: Delete subfamily (sets categories' subfamilyId to null)

### 3. Admin Panel Updates (`src/app/admin/page.tsx`)

#### New Tab: "Subfamilies"
Features:
- Create new subfamily form with:
  - Name input
  - Family dropdown (Men/Women)
  - Active checkbox
- Edit existing subfamilies
- Delete subfamilies
- Visual separation of Men's and Women's subfamilies
- Shows category count for each subfamily

#### Updated Category Management
- Category form now requires subfamily selection
- Dropdown shows "Name (family)" format
- Validates subfamilyId before creation

### 4. Product Filter Updates (`src/app/products/page.tsx`)

#### Filter Hierarchy (in order)
1. **Family Filter**: Men / Women radio buttons
2. **Subfamily Filter**: Shows when family selected
   - Displays subfamilies for selected family
   - Radio button selection
3. **Category Filter**: Filtered by subfamily or family
4. **Subcategory Filter**: Shows when category selected

#### Filter Logic
- Selecting family → shows subfamily options → clears categories
- Selecting subfamily → filters categories by subfamilyId
- Selecting category → shows its subcategories
- All filters have "Clear selection" buttons

### 5. Migration Scripts

#### `/scripts/reorganize-subfamilies.js`
- Deletes all existing subfamilies
- Creates 4 new subfamilies (Footwear and Bags & Accessories for Men/Women)
- Reassigns all categories to appropriate subfamilies
- Successfully executed on Jan 22, 2025

## API Query Parameters

### Products API (`/api/products`)
Supports filtering by:
- `family`: 'men' or 'women'
- `subfamilyId`: Subfamily ID
- `categoryId`: Category ID
- `subcategoryId`: Subcategory ID
- `minPrice`, `maxPrice`: Price range
- `sort`: Sorting option
- `page`, `limit`: Pagination

Filter priority: subfamily → category → subcategory

## Features

### Admin Capabilities
✅ Create/Edit/Delete subfamilies
✅ Assign family (Men/Women) to subfamilies
✅ Toggle subfamily active status
✅ View category count per subfamily
✅ Visual separation of Men's and Women's sections
✅ Edit mode with cancel option

### User Filtering Experience
✅ Hierarchical filter flow (Family → Subfamily → Category)
✅ Dynamic filter updates based on selections
✅ Clear selection options at each level
✅ Consistent UI on desktop and mobile
✅ Real-time product filtering

## Testing Checklist

- [ ] Create new Men's subfamily in admin
- [ ] Create new Women's subfamily in admin
- [ ] Edit existing subfamily
- [ ] Delete subfamily (verify categories unlink)
- [ ] Create category with subfamily selection
- [ ] Filter products by Family → Subfamily → Category flow
- [ ] Test mobile filter drawer
- [ ] Verify API responses include subfamily data
- [ ] Check inactive subfamilies don't show in filters

## Next Steps (Optional Enhancements)

1. **Bulk Operations**: Ability to move multiple categories between subfamilies
2. **Analytics**: Track which subfamily/category combinations are most popular
3. **SEO**: Generate dynamic URLs based on family/subfamily/category (e.g., `/products/men/footwear/boots`)
4. **Validation**: Prevent deleting subfamilies with active categories
5. **Import/Export**: Bulk import subfamily/category structure from CSV
6. **History**: Track changes to subfamily assignments

## Files Modified

### Core Schema
- `prisma/schema.prisma`

### API Routes
- `src/app/api/subfamilies/route.ts` (created)
- `src/app/api/subfamilies/[id]/route.ts` (created)
- `src/app/api/categories/route.ts` (updated)
- `src/app/api/categories/[id]/route.ts` (updated)
- `src/app/api/products/route.ts` (updated)

### UI Components
- `src/app/admin/page.tsx` (major update - added Subfamilies tab)
- `src/app/products/page.tsx` (added subfamily filter)

### Migration Scripts
- `scripts/reorganize-subfamilies.js` (created & executed)
- `scripts/add-family-to-categories.js` (legacy)
- `scripts/migrate-to-subfamilies.js` (legacy)

## Database Commands Used

```bash
# Regenerate Prisma Client (run after schema changes)
npx prisma generate

# Run migration script
node scripts/reorganize-subfamilies.js
```

## Notes

- Server restart required after `npx prisma generate`
- Use Prisma's `connect` syntax for relations, not direct ID assignment
- Categories can exist without subfamily (subfamilyId is nullable)
- Deleting subfamily sets category.subfamilyId to null (not cascading delete)
- Active/inactive subfamilies managed via `isActive` boolean
