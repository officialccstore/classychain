import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// One-time endpoint to make officialccstore@gmail.com an admin.
// Protected by ADMIN_INIT_SECRET env var.
// Call: POST /api/auth/init-admin  body: { "secret": "classychain-init-2024" }
export async function POST(request: Request) {
  try {
    const { secret } = await request.json()

    if (!secret || secret !== process.env.ADMIN_INIT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await prisma.user.updateMany({
      where: { email: 'officialccstore@gmail.com' },
      data: { role: 'admin' },
    })

    if (result.count === 0) {
      return NextResponse.json({ message: 'No user found with that email. Log in with Google first, then call this endpoint.' })
    }

    return NextResponse.json({ success: true, updated: result.count })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
