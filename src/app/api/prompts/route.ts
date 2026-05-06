import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { prompts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get('category');

    const rows = category
      ? await db
          .select()
          .from(prompts)
          .where(eq(prompts.category, category))
          .orderBy(desc(prompts.updatedAt))
      : await db
          .select()
          .from(prompts)
          .orderBy(desc(prompts.updatedAt));

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
  } catch {
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
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

    await db
      .update(prompts)
      .set({
        title: title.trim(),
        content: content.trim(),
        category: category?.trim() || '',
        updatedAt: new Date(),
      })
      .where(eq(prompts.id, id));

    const row = await db.query.prompts.findFirst({
      where: eq(prompts.id, id),
    });

    return NextResponse.json(row);
  } catch {
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    await db.delete(prompts).where(eq(prompts.id, id));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}
