import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { signToken } from '@/lib/auth'

const GOOGLE_SETUP_TOKEN_TTL = '15m'

export async function POST(request: Request) {
  try {
    const { credential } = await request.json()

    if (!credential) {
      return NextResponse.json({ error: 'Missing Google credential' }, { status: 400 })
    }

    // Verify the Google ID token using Google's tokeninfo endpoint
    const tokenInfoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    )

    if (!tokenInfoRes.ok) {
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 })
    }

    const tokenInfo = await tokenInfoRes.json()

    // Validate the audience matches our client ID
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (clientId && tokenInfo.aud !== clientId) {
      return NextResponse.json({ error: 'Token audience mismatch' }, { status: 401 })
    }

    const { email, name, sub: googleId } = tokenInfo

    if (!email) {
      return NextResponse.json({ error: 'Could not get email from Google' }, { status: 400 })
    }

    // Existing account (whether created via Google or otherwise) — log straight in.
    const user = await prisma.user.findFirst({ where: { email } })
    if (user) {
      const token = signToken({ id: user.id, email: user.email, role: user.role })
      return NextResponse.json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone },
        token,
      })
    }

    // New Google user: don't create the account yet — every account needs a verified
    // phone number for order/delivery flows, so send them through phone + OTP first.
    const googleSetupToken = signToken({ email, name: name || email.split('@')[0], purpose: 'google-setup' }, GOOGLE_SETUP_TOKEN_TTL)
    return NextResponse.json({ isNewUser: true, googleSetupToken, email, name: name || email.split('@')[0] })
  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.json({ error: 'Google authentication failed' }, { status: 500 })
  }
}
