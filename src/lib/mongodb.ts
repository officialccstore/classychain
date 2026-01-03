import { MongoClient, ServerApiVersion } from 'mongodb'

const uri = process.env.MONGODB_URI || process.env.DATABASE_URL || ''

if (!uri) {
  throw new Error('MONGODB_URI or DATABASE_URL must be set in .env.local')
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined
}

// Create a cached client for serverless / hot-reload environments
if (!globalThis.__mongoClientPromise) {
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  })
  globalThis.__mongoClientPromise = client.connect()
}

clientPromise = globalThis.__mongoClientPromise!

export default clientPromise

export async function pingMongo() {
  const client = await clientPromise
  const adminDb = client.db().admin()
  const result = await adminDb.ping()
  return result
}
