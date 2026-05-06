import { NextResponse } from 'next/server';
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
        { error: 'API key not configured' },
        { status: 401 }
      );
    }

    const client = new KieApiClient(row.apiKey);
    const credits = await client.getCredits();

    return NextResponse.json({ credits });
  } catch (error) {
    if (error instanceof KieApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 401 ? 401 : 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 }
    );
  }
}
