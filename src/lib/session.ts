import { createHmac } from 'crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7日

function getSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is not set')
  return secret
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex')
}

export function createSessionToken(email: string): string {
  const payload = JSON.stringify({ email, exp: Date.now() + MAX_AGE * 1000 })
  const encoded = Buffer.from(payload).toString('base64url')
  const sig = sign(encoded)
  return `${encoded}.${sig}`
}

export function verifySessionToken(token: string): { email: string } | null {
  try {
    const [encoded, sig] = token.split('.')
    if (!encoded || !sig) return null
    if (sign(encoded) !== sig) return null

    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as {
      email: string
      exp: number
    }
    if (Date.now() > payload.exp) return null

    return { email: payload.email }
  } catch {
    return null
  }
}

export async function getSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export function setSessionCookie(token: string): { name: string; value: string; options: object } {
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: MAX_AGE,
      path: '/',
    },
  }
}
