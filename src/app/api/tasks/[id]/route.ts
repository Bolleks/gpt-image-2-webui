import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings, tasks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { KieApiClient } from '@/lib/services/KieApiClient';
import { requireUserId } from '@/lib/auth/session';
import fs from 'fs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id: taskId } = await params;

    const task = await db.query.tasks.findFirst({
      where: and(eq(tasks.id, taskId), eq(tasks.userId, userId)),
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.status === 'success' || task.status === 'fail') {
      return NextResponse.json({
        taskId: task.id,
        status: task.status,
        progress: null,
        imageUrl: task.localPath
          ? `/api/images/${encodeURIComponent(task.id)}`
          : null,
        failMsg: task.failMsg || null,
        costTime: task.costTime || null,
      });
    }

    const row = await db.query.settings.findFirst({
      where: eq(settings.id, userId),
    });

    if (!row) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 401 }
      );
    }

    const client = new KieApiClient(row.apiKey);
    const details = await client.getTaskDetails(taskId);

    let newStatus = details.state;
    let extra: Record<string, unknown> = {};

    if (details.state === 'success') {
      const resultJson = JSON.parse(details.resultJson || '{}');
      const resultUrl = resultJson.resultUrls?.[0];

      extra = { resultUrl, costTime: details.costTime };

      if (resultUrl) {
        try {
          const ImageDownloader = (
            await import('@/lib/services/ImageDownloader')
          ).ImageDownloader;
          const downloader = new ImageDownloader(
            row.storagePath,
            new KieApiClient(row.apiKey)
          );
          const localPath = await downloader.downloadAndSave(resultUrl, taskId);
          extra.localPath = localPath;
        } catch (downloadError) {
          newStatus = 'download_failed';
          extra.failCode = 'DOWNLOAD_FAILED';
          extra.failMsg = downloadError instanceof Error
            ? `Failed to download image: ${downloadError.message}`
            : 'Failed to download image';
        }
      }
    }

    if (details.state === 'fail') {
      extra = {
        failCode: details.failCode,
        failMsg: details.failMsg,
      };
    }

    await db
      .update(tasks)
      .set({
        status: newStatus,
        ...extra,
        updatedAt: new Date(),
        completedAt:
          newStatus === 'success' || newStatus === 'fail' || newStatus === 'download_failed'
            ? new Date()
            : undefined,
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

    return NextResponse.json({
      taskId,
      status: newStatus,
      progress: details.progress,
      imageUrl:
        newStatus === 'success' && extra.localPath
          ? `/api/images/${encodeURIComponent(taskId)}`
          : null,
      failMsg: extra.failMsg as string | null,
      costTime: details.costTime || null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch task status' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id: taskId } = await params;

    const task = await db.query.tasks.findFirst({
      where: and(eq(tasks.id, taskId), eq(tasks.userId, userId)),
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.localPath) {
      try {
        if (fs.existsSync(task.localPath)) {
          fs.unlinkSync(task.localPath);
        }
      } catch {
        // File deletion failed, continue with DB deletion
      }
    }

    await db.delete(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}