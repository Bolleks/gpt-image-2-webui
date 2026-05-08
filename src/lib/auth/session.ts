import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('authjs.session-token')?.value
    ?? request.cookies.get('__Secure-authjs.session-token')?.value;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'fallback-secret-for-build');
    const { payload } = await jwtVerify(token, secret);
    return (payload.id as string) ?? null;
  } catch {
    return null;
  }
}

export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}