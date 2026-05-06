import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { KieApiClient, KieApiError } from '@/lib/services/KieApiClient';

export async function GET() {
  try {
    const row = await db.query.settings.findFirst({
      where: eq(settings.id, 'default'),
    });

    if (!row) {
      return NextResponse.json(
        { error: 'Settings not configured' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      apiKey: row.apiKey || null,
      webhookHmacKey: row.webhookHmacKey || null,
      storagePath: row.storagePath,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, webhookHmacKey, storagePath } = body;

    const existing = await db.query.settings.findFirst({
      where: eq(settings.id, 'default'),
    });

    if (!existing) {
      if (!apiKey) {
        return NextResponse.json(
          { error: 'API key is required' },
          { status: 400 }
        );
      }

      await db.insert(settings).values({
        id: 'default',
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
        .where(eq(settings.id, 'default'));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const existing = await db.query.settings.findFirst({
      where: eq(settings.id, 'default'),
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
      .where(eq(settings.id, 'default'));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
    return NextResponse.json(
      { error: 'Connection test failed' },
      { status: 500 }
    );
  }
}
