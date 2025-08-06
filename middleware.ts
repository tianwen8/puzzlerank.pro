import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 404死链重定向映射
  const redirectMap: Record<string, string> = {
    '/games/wordle': '/',
    '/games/wordle/': '/',
    '/games': '/',
    '/guides/best-starting-words': '/strategy',
    '/guides/5-letter-word-tips': '/strategy',
    '/guides/word-puzzle-strategy': '/strategy',
    '/guides/puzzle-ranking-system': '/guide/rankings',
    '/guides': '/strategy',
    '/rankings/word-puzzle': '/guide/rankings',
    '/rankings/2048': '/guide/rankings',
    '/rankings': '/guide/rankings',
    '/leaderboard': '/guide/rankings',
    '/2048-game': '/',
    '/word-puzzle': '/',
    '/statistics': '/guide/stats',
    '/player-stats': '/guide/stats',
    '/daily-challenge': '/',
    '/achievements': '/',
    '/tournaments': '/',
    '/terms-of-service': '/about',
    '/privacy-policy': '/about',
    '/contact': '/about',
  }

  // 处理重定向
  if (redirectMap[pathname]) {
    const url = request.nextUrl.clone()
    url.pathname = redirectMap[pathname]
    return NextResponse.redirect(url, 301)
  }

  // 处理邮件保护页面 - 返回410 Gone
  if (pathname.includes('/cdn-cgi/l/email-protection')) {
    return new NextResponse(null, { status: 410 })
  }

  // 统一域名处理 (如果需要)
  const host = request.headers.get('host')
  if (host?.startsWith('www.')) {
    const url = request.nextUrl.clone()
    url.host = host.replace('www.', '')
    return NextResponse.redirect(url, 301)
  }

  // 添加安全头
  const response = NextResponse.next()
  
  // 性能优化头
  if (pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }
  
  if (pathname.startsWith('/images/') || pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|ico|svg)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // 安全头
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了以下开头的：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}