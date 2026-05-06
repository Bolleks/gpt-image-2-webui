import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings, tasks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { KieApiClient, KieApiError, deleteUploadedFile } from '@/lib/services/KieApiClient';
import { AspectRatio, Resolution } from '@/lib/types';

const VALID_ASPECT_RATIOS: AspectRatio[] = ['auto', '1:1', '9:16', '16:9', '4:3', '3:4'];
const VALID_RESOLUTIONS: Resolution[] = ['1K', '2K', '4K'];

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { prompt, aspectRatio, resolution, inputUrls } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.length < 1 || prompt.length > 20000) {
      return NextResponse.json(
        { error: 'Prompt must be 1-20000 characters' },
        { status: 422 }
      );
    }

    if (!VALID_ASPECT_RATIOS.includes(aspectRatio)) {
      return NextResponse.json(
        { error: 'Invalid aspect ratio' },
        { status: 422 }
      );
    }

    if (!VALID_RESOLUTIONS.includes(resolution)) {
      return NextResponse.json(
        { error: 'Invalid resolution' },
        { status: 422 }
      );
    }

    if (resolution === '4K' && (aspectRatio === '1:1' || aspectRatio === 'auto')) {
      return NextResponse.json(
        { error: '4K resolution is not supported with 1:1 or auto aspect ratio' },
        { status: 422 }
      );
    }

    if (inputUrls !== undefined) {
      if (!Array.isArray(inputUrls)) {
        return NextResponse.json(
          { error: 'inputUrls must be an array' },
          { status: 422 }
        );
      }
      if (inputUrls.length > 3) {
        return NextResponse.json(
          { error: 'Maximum 3 images allowed' },
          { status: 422 }
        );
      }
    }

    const client = new KieApiClient(row.apiKey);
    const callBackUrl = process.env.APP_URL
      ? `${process.env.APP_URL}/api/webhook/kie`
      : undefined;

    const taskId = await client.createTask({
      prompt,
      aspectRatio,
      resolution,
      callBackUrl,
      inputUrls: inputUrls?.length > 0 ? inputUrls : undefined,
    });

    await db.insert(tasks).values({
      id: taskId,
      prompt,
      aspectRatio,
      resolution,
      inputUrls: inputUrls?.length > 0 ? JSON.stringify(inputUrls) : null,
      status: 'waiting',
    });

    // Clean up uploaded files after successful task creation
    if (inputUrls?.length > 0) {
      await Promise.all(inputUrls.map((url: string) => deleteUploadedFile(url)));
    }

    return NextResponse.json({ taskId, status: 'waiting' });
  } catch (error) {
    if (error instanceof KieApiError) {
      const statusMap: Record<number, number> = {
        401: 401,
        402: 402,
        422: 422,
        429: 429,
        455: 503,
        500: 502,
        501: 500,
      };
      return NextResponse.json(
        { error: error.message },
        { status: statusMap[error.code] || 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
