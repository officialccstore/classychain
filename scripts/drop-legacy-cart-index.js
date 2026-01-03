/*
 * Drops legacy unique index on CartItem.productId to allow multiple size variants per user.
 * Usage (ensure DATABASE_URL env is set):
 *   node scripts/drop-legacy-cart-index.js
 */
const { MongoClient } = require('mongodb')

async function main() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL
  if (!uri) throw new Error('Set MONGODB_URI or DATABASE_URL')

  const client = new MongoClient(uri)
  await client.connect()
  const dbName = client.db().databaseName
  const db = client.db()
  const coll = db.collection('CartItem')

  console.log(`Connected to ${dbName}. Checking indexes on CartItem...`)
  const indexes = await coll.indexes()
  console.log('Current indexes:', indexes)

  // Common legacy names
  const legacyNames = ['productId_1', 'CartItem_productId_key']
  for (const name of legacyNames) {
    if (indexes.some((idx) => idx.name === name)) {
      console.log(`Dropping legacy index: ${name}`)
      await coll.dropIndex(name)
    }
  }

  const after = await coll.indexes()
  console.log('Indexes after cleanup:', after)
  await client.close()
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
