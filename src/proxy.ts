import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken } from '@/lib/session'

const ROOT_DOMAIN = 'coreai-x.com'

export default async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // ローカル開発環境ではサブドメインルーティングをスキップ
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return NextResponse.next()
  }

  // セッション取得
  const sessionToken = request.cookies.get('session')?.value
  const session = sessionToken ? await verifySessionToken(sessionToken) : null

  // サブドメインを取得
  const subdomain = hostname.endsWith(`.${ROOT_DOMAIN}`)
    ? hostname.slice(0, -(ROOT_DOMAIN.length + 1))
    : null

  // admin.coreai-x.com
  if (subdomain === 'admin') {
    // ログインページは認証不要
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }
    // 未認証またはadminロールでない → ログインへ
    if (!session || session.role !== 'admin') {
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
    // /admin/* に書き換え
    if (!pathname.startsWith('/admin')) {
      url.pathname = '/admin' + (pathname === '/' ? '' : pathname)
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

  // app.coreai-x.com
  if (subdomain === 'app') {
    const isPublicPath =
      pathname.startsWith('/login') ||
      pathname.startsWith('/onboard') ||
      pathname.startsWith('/api/')

    // 認証済みでloginページ → /dashboardへ（verify APIがslugを解決する）
    if (session && pathname.startsWith('/login')) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // 未認証でprotectedページ → /loginへ
    if (!session && !isPublicPath) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // ルート → /dashboard or /login
    if (pathname === '/') {
      url.pathname = session ? '/dashboard' : '/login'
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  }

  // {slug}.coreai-x.com → 公開サイト
  if (subdomain && subdomain !== 'www') {
    if (pathname === '/') {
      url.pathname = `/${subdomain}`
      return NextResponse.rewrite(url)
    }
    url.pathname = `/${subdomain}${pathname}`
    return NextResponse.rewrite(url)
  }

  // coreai-x.com → LP
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)', '/api/(.*)'],
}
