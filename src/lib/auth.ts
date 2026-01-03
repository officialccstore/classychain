import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
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
