import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allTasks = await db.query.tasks.findMany({
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
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
