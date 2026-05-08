import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = () => new TextEncoder().encode(process.env.AUTH_SECRET || 'fallback-secret-for-build');

const publicPaths = [
  '/auth/signin',
  '/auth/signup',
  '/api/auth',
  '/api/health',
  '/api/webhook',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('authjs.session-token')?.value
    ?? request.cookies.get('__Secure-authjs.session-token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  try {
    await jwtVerify(token, SECRET());
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};