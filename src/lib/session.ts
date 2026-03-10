// Web Crypto API を使用（Edge Runtime・Node.js 両対応）

const COOKIE_NAME = 'session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7日

function getSecretBytes(): ArrayBuffer {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is not set')
  const encoded = new TextEncoder().encode(secret)
  return encoded.buffer.slice(0)
}

async function getKey(usage: 'sign' | 'verify'): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    getSecretBytes(),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage],
  )
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function fromBase64Url(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4)
  const bin = atob(padded)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

export async function createSessionToken(email: string, role: 'admin' | 'user'): Promise<string> {
  const payload = JSON.stringify({ email, role, exp: Date.now() + MAX_AGE * 1000 })
  const encoded = toBase64Url(new TextEncoder().encode(payload))
  const key = await getKey('sign')
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(encoded) as unknown as ArrayBuffer)
  return `${encoded}.${toBase64Url(new Uint8Array(sig))}`
}

export async function verifySessionToken(token: string): Promise<{ email: string; role: 'admin' | 'user' } | null> {
  try {
    const [encoded, sig] = token.split('.')
    if (!encoded || !sig) return null
    const key = await getKey('verify')
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(sig) as unknown as ArrayBuffer,
      new TextEncoder().encode(encoded) as unknown as ArrayBuffer,
    )
    if (!valid) return null
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(encoded)),
    ) as { email: string; role?: 'admin' | 'user'; exp: number }
    if (Date.now() > payload.exp) return null
    return { email: payload.email, role: payload.role ?? 'user' }
  } catch {
    return null
  }
}

export async function getSession(): Promise<{ email: string; role: 'admin' | 'user' } | null> {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export function sessionCookieOptions(value: string) {
  return {
    name: COOKIE_NAME,
    value,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: MAX_AGE,
      path: '/',
    },
  }
}
