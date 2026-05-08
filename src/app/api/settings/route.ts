import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { KieApiClient, KieApiError } from '@/lib/services/KieApiClient';
import { jwtVerify } from 'jose';

async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
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

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return unauthorized();

    const row = await db.query.settings.findFirst({
      where: eq(settings.userId, userId),
    });

    if (!row) {
      return NextResponse.json({
        apiKey: null,
        webhookHmacKey: null,
        storagePath: '/data/images',
      });
    }

    return NextResponse.json({
      apiKey: row.apiKey || null,
      webhookHmacKey: row.webhookHmacKey || null,
      storagePath: row.storagePath,
    });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return unauthorized();

    const body = await request.json();
    const { apiKey, webhookHmacKey, storagePath } = body;

    const existing = await db.query.settings.findFirst({
      where: eq(settings.userId, userId),
    });

    if (!existing) {
      if (!apiKey) {
        return NextResponse.json(
          { error: 'API key is required' },
          { status: 400 }
        );
      }

      await db.insert(settings).values({
        id: userId,
        userId,
        apiKey,
        webhookHmacKey: webhookHmacKey || null,
        storagePath: storagePath || '/data/images',
      });
    } else {
      await db
        .update(settings)
        .set({
          ...(apiKey && { apiKey }),
          ...(webhookHmacKey !== undefined && { webhookHmacKey }),
          ...(storagePath !== undefined && { storagePath }),
          updatedAt: new Date(),
        })
        .where(eq(settings.id, existing.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return unauthorized();

    const existing = await db.query.settings.findFirst({
      where: eq(settings.userId, userId),
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 404 }
      );
    }

    await db
      .update(settings)
      .set({ apiKey: '', updatedAt: new Date() })
      .where(eq(settings.id, existing.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return unauthorized();

    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    const client = new KieApiClient(apiKey);
    const credits = await client.getCredits();

    return NextResponse.json({ success: true, credits });
  } catch (error) {
    if (error instanceof KieApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 401 ? 401 : 500 }
      );
    }
    console.error('Settings POST error:', error);
    return NextResponse.json(
      { error: 'Connection test failed' },
      { status: 500 }
    );
  }
}