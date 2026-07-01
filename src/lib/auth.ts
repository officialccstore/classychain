import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'

export function signToken(payload: object, expiresIn: string | number = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as any)
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (e) {
    return null
  }
}

export function getTokenFromReq(req: NextRequest | { headers?: any, cookies?: any }) {
  // Prefer Authorization header
  const authHeader = (req as any).headers?.get ? (req as any).headers.get('authorization') : (req as any).headers?.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1]
  }
  // Fallback to cookie named token
  try {
    const cookieHeader = (req as any).headers?.get ? (req as any).headers.get('cookie') : (req as any).headers?.cookie
    if (cookieHeader) {
      const match = cookieHeader.match(/token=([^;]+)/)
      if (match) return match[1]
    }
  } catch (e) {}
  return null
}

export async function verifyAuth(req: NextRequest | { headers?: any, cookies?: any } | Request) {
  // Accept either NextRequest or standard Request
  try {
    let token: string | null = null

    // If it's a NextRequest-like object
    if ((req as any).headers) {
      token = getTokenFromReq(req as any)
    }

    // If still no token and Request provided, try to read Authorization header
    if (!token && (req as Request)) {
      try {
        const maybeReq = req as Request
        const authHeader = maybeReq.headers.get('authorization')
        if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1]
      } catch (e) {
        // ignore
      }
    }

    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    // Standardize return shape
    return {
      userId: (payload as any).id || (payload as any).userId,
      email: (payload as any).email,
      role: (payload as any).role,
      payload,
    }
  } catch (e) {
    return null
  }
}

// Note: `verifyAuth` is exported via its function declaration above.
