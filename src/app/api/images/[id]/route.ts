import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks, settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ImageDownloader } from '@/lib/services/ImageDownloader';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: taskId } = await params;

  try {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!task || !task.localPath) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const row = await db.query.settings.findFirst({
      where: eq(settings.id, 'default'),
    });

    if (!row) {
      return NextResponse.json({ error: 'Settings missing' }, { status: 500 });
    }

    const downloader = new ImageDownloader(row.storagePath, {} as any);

    if (!downloader.fileExists(task.localPath)) {
      return NextResponse.json(
        { error: 'File not found on disk' },
        { status: 404 }
      );
    }

    const buffer = downloader.getFileBuffer(task.localPath);
    const mimeType = downloader.getFileMimeType(task.localPath);

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to serve image' },
      { status: 500 }
    );
  }
}
