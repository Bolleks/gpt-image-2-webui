import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';
import { settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ImageDownloader } from '@/lib/services/ImageDownloader';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const { id: taskId } = await params;

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