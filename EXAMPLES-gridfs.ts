import { MongoClient, GridFSBucket, ObjectId } from 'mongodb'
import { Readable } from 'stream'

export async function uploadToGridFS(file: File, filename: string) {
  const uri = process.env.DATABASE_URL || ''
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db()
    const bucket = new GridFSBucket(db, { bucketName: 'images' })

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create readable stream from buffer
    const readableStream = Readable.from(buffer)

    // Upload to GridFS
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        originalName: file.name,
        uploadDate: new Date(),
      },
    })

    // Pipe the file to GridFS
    readableStream.pipe(uploadStream)

    return new Promise((resolve, reject) => {
      uploadStream.on('finish', () => {
        resolve({
          fileId: uploadStream.id.toString(),
          filename: filename,
        })
      })
      uploadStream.on('error', reject)
    })
  } finally {
    await client.close()
  }
}

export async function getImageFromGridFS(fileId: string) {
  const uri = process.env.DATABASE_URL || ''
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db()
    const bucket = new GridFSBucket(db, { bucketName: 'images' })

    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId))

    // Convert stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of downloadStream) {
      chunks.push(chunk)
    }

    return Buffer.concat(chunks)
  } finally {
    await client.close()
  }
}

// API Route example
// src/app/api/upload-gridfs/route.ts
export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  const result = await uploadToGridFS(file, file.name)
  return Response.json(result)
}

// Get image route
// src/app/api/images/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const buffer = await getImageFromGridFS(params.id)

  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000',
    },
  })
}
