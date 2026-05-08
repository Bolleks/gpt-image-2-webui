import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings, tasks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { KieApiClient } from '@/lib/services/KieApiClient';
import { ImageDownloader } from '@/lib/services/ImageDownloader';
import { requireUserId } from '@/lib/auth/session';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  try {
    const userId = await requireUserId();

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!task || !task.localPath || task.userId !== userId) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const row = await db.query.settings.findFirst({
      where: eq(settings.userId, userId),
    });

    const storagePath = row?.storagePath || '/data/images';

    const downloader = new ImageDownloader(storagePath, {} as any);

    if (!downloader.fileExists(task.localPath)) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
    }

    const buffer = downloader.getFileBuffer(task.localPath);
    const mimeType = downloader.getFileMimeType(task.localPath);
    const ext = task.localPath.match(/\.[^.]+$/)?.[0] || '.png';

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${taskId}${ext}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to download image' }, { status: 500 });
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  try {
    const userId = await requireUserId();

    const row = await db.query.settings.findFirst({
      where: eq(settings.userId, userId),
    });

    if (!row?.apiKey) {
      return NextResponse.json(
        { error: 'Settings not configured' },
        { status: 500 }
      );
    }

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!task || task.userId !== userId) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.status !== 'success') {
      return NextResponse.json(
        { error: 'Task not completed' },
        { status: 400 }
      );
    }

    if (task.localPath) {
      return NextResponse.json({ localPath: task.localPath });
    }

    if (!task.resultUrl) {
      return NextResponse.json(
        { error: 'No result URL available' },
        { status: 400 }
      );
    }

    const kieClient = new KieApiClient(row.apiKey);
    const downloader = new ImageDownloader(row.storagePath, kieClient);
    const localPath = await downloader.downloadAndSave(task.resultUrl, taskId);

    await db
      .update(tasks)
      .set({ localPath, updatedAt: new Date() })
      .where(eq(tasks.id, taskId));

    return NextResponse.json({ localPath });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to download image' },
      { status: 500 }
    );
  }
}