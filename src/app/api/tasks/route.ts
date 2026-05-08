import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
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
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}