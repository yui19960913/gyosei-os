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
    ? 'https://app.coreai-x.com'
    : 'http://localhost:3000'

  // そのユーザーのサイトを取得してダッシュボードに直接リダイレクト
  const site = await prisma.aiSite.findFirst({ where: { ownerEmail: magic.email }, orderBy: { createdAt: 'desc' } })

  const redirectPath = site ? `/dashboard/${site.slug}` : '/onboard'
  const res = NextResponse.redirect(new URL(redirectPath, appUrl))
  res.cookies.set(name, value, options)
  return res
}
