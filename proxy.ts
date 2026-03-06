import { NextRequest, NextResponse } from 'next/server';

const LAUNCH = new Date('2026-03-07T21:00:00Z').getTime();
const ALLOWED = ['/', '/api/subscribe'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|css|js)$/)
  ) {
    return NextResponse.next();
  }

  if (Date.now() >= LAUNCH) return NextResponse.next();
  if (ALLOWED.includes(pathname)) return NextResponse.next();

  return NextResponse.redirect(new URL('/', req.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
