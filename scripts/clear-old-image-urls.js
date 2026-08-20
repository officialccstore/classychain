/*
 * Clears stale Cloudinary image URLs from Product and DealProduct records so
 * the admin panel shows them as missing an image and they can be re-uploaded
 * to S3 via the existing /admin product editor.
 *
 * By default this is a DRY RUN — it only prints what would change.
 * Pass --apply to actually write the changes.
 *
 * Usage:
 *   node scripts/clear-old-image-urls.js          # dry run
 *   node scripts/clear-old-image-urls.js --apply   # perform the update
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const OLD_HOST = 'cloudinary.com';
const APPLY = process.argv.includes('--apply');

function isOldUrl(url) {
  return typeof url === 'string' && url.includes(OLD_HOST);
}

async function clear(model, label) {
  const records = await model.findMany({
    select: { id: true, name: true, image: true, images: true },
  });

  let changed = 0;

  for (const record of records) {
    const hadOldImage = isOldUrl(record.image);
    const keptImages = (record.images || []).filter((url) => !isOldUrl(url));
    const removedCount = (record.images || []).length - keptImages.length;

    if (!hadOldImage && removedCount === 0) continue;

    changed++;
    console.log(`${APPLY ? 'Clearing' : '[dry run] Would clear'}: ${record.name} (${record.id})`);
    if (hadOldImage) console.log(`  image: "${record.image}" -> ""`);
    if (removedCount > 0) console.log(`  images[]: removing ${removedCount} stale entr${removedCount === 1 ? 'y' : 'ies'}`);

    if (APPLY) {
      await model.update({
        where: { id: record.id },
        data: {
          image: hadOldImage ? '' : record.image,
          images: keptImages,
        },
      });
    }
  }

  console.log(`${label}: ${changed} of ${records.length} updated`);
  return changed;
}

async function main() {
  if (!APPLY) {
    console.log('Running in DRY RUN mode. No changes will be written. Pass --apply to actually update the DB.\n');
  }

  const productsChanged = await clear(prisma.product, 'Products');
  const dealProductsChanged = await clear(prisma.dealProduct, 'Deal products');

  console.log(`\n${APPLY ? 'Done.' : 'Dry run complete.'} ${productsChanged + dealProductsChanged} record(s) ${APPLY ? 'updated' : 'would be updated'}.`);
  if (!APPLY) {
    console.log('Re-run with --apply to perform the update.');
  } else {
    console.log('Go to /admin and re-upload images for the affected products.');
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
