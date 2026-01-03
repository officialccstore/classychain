const { MongoClient, ServerApiVersion } = require('mongodb')
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') })

const uri = process.env.MONGODB_URI || process.env.DATABASE_URL
if (!uri) {
  console.error('MONGODB_URI or DATABASE_URL is not set in .env.local')
  process.exit(1)
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})

async function run() {
  try {
    await client.connect()
    const admin = client.db().admin()
    const res = await admin.command({ ping: 1 })
    console.log('Ping response:', res)
  } catch (err) {
    console.error('Failed to connect/ping MongoDB:', err)
    process.exit(1)
  } finally {
    await client.close()
  }
}

run()
