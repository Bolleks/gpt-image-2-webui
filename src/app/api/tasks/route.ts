import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireUserId } from '@/lib/auth/session';

export async function GET() {
  try {
    const userId = await requireUserId();

    const allTasks = await db.query.tasks.findMany({
      where: eq(tasks.userId, userId),
      orderBy: desc(tasks.createdAt),
    });

    return NextResponse.json({
      tasks: allTasks.map((t) => ({
        id: t.id,
        prompt: t.prompt,
        aspectRatio: t.aspectRatio,
        resolution: t.resolution,
        status: t.status,
        failCode: t.failCode,
        failMsg: t.failMsg,
        costTime: t.costTime,
        createdAt: t.createdAt,
        completedAt: t.completedAt,
        localPath: t.localPath,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}