import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSessionToken, sessionCookieOptions } from '@/lib/session'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid', req.url))
  }

  const magic = await prisma.magicToken.findUnique({ where: { token } })

  if (!magic || magic.usedAt || magic.expiresAt < new Date()) {
    return NextResponse.redirect(new URL('/login?error=expired', req.url))
  }

  // トークンを使用済みにする
  await prisma.magicToken.update({
    where: { token },
    data: { usedAt: new Date() },
  })

  // セッション作成
  const sessionToken = await createSessionToken(magic.email, 'user')
  const { name, value, options } = sessionCookieOptions(sessionToken)

  const appUrl = process.env.NODE_ENV === 'production'
    ? 'https://app.webseisei.com'
    : 'http://localhost:3000'

  // next パラメータがあればそこへ、なければサイトのダッシュボードへ
  const next = req.nextUrl.searchParams.get('next')
  const site = await prisma.aiSite.findFirst({ where: { ownerEmail: magic.email }, orderBy: { createdAt: 'desc' } })

  const redirectUrl = next
    ? new URL(next, req.url)
    : new URL(site ? `/dashboard/${site.slug}` : '/', appUrl)
  const res = NextResponse.redirect(redirectUrl)
  res.cookies.set(name, value, options)
  return res
}
