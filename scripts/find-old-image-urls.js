/*
 * Scans Product and DealProduct records for image URLs still pointing at the
 * old Cloudinary account (now expired) and writes a JSON report/backup.
 *
 * Usage:
 *   node scripts/find-old-image-urls.js
 */
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const OLD_HOST = 'cloudinary.com';

function isOldUrl(url) {
  return typeof url === 'string' && url.includes(OLD_HOST);
}

async function scan(model, label) {
  const records = await model.findMany({
    select: { id: true, name: true, image: true, images: true },
  });

  const affected = [];
  for (const record of records) {
    const oldImage = isOldUrl(record.image) ? record.image : null;
    const oldImages = (record.images || []).filter(isOldUrl);

    if (oldImage || oldImages.length > 0) {
      affected.push({
        id: record.id,
        name: record.name,
        oldImage,
        oldImages,
      });
    }
  }

  console.log(`\n${label}: ${affected.length} of ${records.length} have old Cloudinary URLs`);
  for (const item of affected) {
    console.log(`  - ${item.name} (${item.id})`);
    if (item.oldImage) console.log(`      image: ${item.oldImage}`);
    if (item.oldImages.length) console.log(`      images[]: ${item.oldImages.length} stale entr${item.oldImages.length === 1 ? 'y' : 'ies'}`);
  }

  return affected;
}

async function main() {
  console.log(`Scanning for image URLs containing "${OLD_HOST}"...`);

  const products = await scan(prisma.product, 'Products');
  const dealProducts = await scan(prisma.dealProduct, 'Deal products');

  const report = {
    scannedAt: new Date().toISOString(),
    oldHost: OLD_HOST,
    products,
    dealProducts,
  };

  const outPath = path.join(__dirname, `old-image-urls-backup.${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log(`\nBackup of old URLs written to: ${outPath}`);
  console.log(`Total affected: ${products.length} products, ${dealProducts.length} deal products`);
  console.log('\nRun scripts/clear-old-image-urls.js to remove these URLs from the DB.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
