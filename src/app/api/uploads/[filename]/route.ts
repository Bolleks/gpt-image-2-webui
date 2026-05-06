import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'data', 'uploads');

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    const filepath = join(UPLOAD_DIR, filename);
    if (!filepath.startsWith(UPLOAD_DIR)) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }
    const buffer = await readFile(filepath);

    const ext = filename.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
    };

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentTypes[ext || ''] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
