import { NextRequest, NextResponse } from 'next/server'
import { createSessionToken, setSessionCookie } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json() as { email: string; password: string }

  const adminEmail = process.env.ADMIN_EMAIL ?? ''
  const adminPassword = process.env.ADMIN_PASSWORD ?? ''

  if (!adminEmail || !adminPassword) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ error: 'メールアドレスまたはパスワードが正しくありません' }, { status: 401 })
  }

  const token = createSessionToken(email)
  const { name, value, options } = setSessionCookie(token)

  const res = NextResponse.json({ success: true })
  res.cookies.set(name, value, options)
  return res
}
