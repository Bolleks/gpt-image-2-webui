import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { prompts } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { requireUserId } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const category = request.nextUrl.searchParams.get('category');

    const rows = category
      ? await db
          .select()
          .from(prompts)
          .where(and(eq(prompts.userId, userId), eq(prompts.category, category)))
          .orderBy(desc(prompts.updatedAt))
      : await db
          .select()
          .from(prompts)
          .where(eq(prompts.userId, userId))
          .orderBy(desc(prompts.updatedAt));

    return NextResponse.json(rows);
  } catch {
    if (new Error().message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();

    const body = await request.json();
    const { title, content, category } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const now = new Date();

    await db.insert(prompts).values({
      id,
      userId,
      title: title.trim(),
      content: content.trim(),
      category: category?.trim() || '',
      createdAt: now,
      updatedAt: now,
    });

    const row = await db.query.prompts.findFirst({
      where: eq(prompts.id, id),
    });

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await requireUserId();

    const body = await request.json();
    const { id, title, content, category } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const existing = await db.query.prompts.findFirst({
      where: and(eq(prompts.id, id), eq(prompts.userId, userId)),
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    await db
      .update(prompts)
      .set({
        title: title.trim(),
        content: content.trim(),
        category: category?.trim() || '',
        updatedAt: new Date(),
      })
      .where(and(eq(prompts.id, id), eq(prompts.userId, userId)));

    const row = await db.query.prompts.findFirst({
      where: eq(prompts.id, id),
    });

    return NextResponse.json(row);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireUserId();

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.query.prompts.findFirst({
      where: and(eq(prompts.id, id), eq(prompts.userId, userId)),
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    await db.delete(prompts).where(and(eq(prompts.id, id), eq(prompts.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}