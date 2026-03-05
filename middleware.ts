import { NextRequest, NextResponse } from "next/server";

// Launch: Saturday March 7 2026 3:00 PM CST = 21:00 UTC
const LAUNCH = new Date("2026-03-07T21:00:00Z").getTime();

// Routes allowed before launch
const ALLOWED = [
  "/",
  "/api/subscribe",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow static files, _next internals, and favicon
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // After launch — let everything through
  if (Date.now() >= LAUNCH) {
    return NextResponse.next();
  }

  // Before launch — only allow root and subscribe API
  if (ALLOWED.includes(pathname)) {
    return NextResponse.next();
  }

  // Block everything else — redirect to coming soon
  return NextResponse.redirect(new URL("/", req.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
