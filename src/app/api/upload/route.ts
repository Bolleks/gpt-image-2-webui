import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FILES = 3;

export async function POST(request: NextRequest) {
  try {
    const row = await db.query.settings.findFirst({
      where: eq(settings.id, 'default'),
    });

    if (!row?.apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 422 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} images allowed` },
        { status: 422 }
      );
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: 'Only PNG, JPG, WEBP are supported' },
          { status: 422 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'File size must be under 10MB' },
          { status: 422 }
        );
      }

      const kieFormData = new FormData();
      kieFormData.append('file', file);
      kieFormData.append('uploadPath', 'images');

      const kieResponse = await fetch('https://kieai.redpandaai.co/api/file-stream-upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${row.apiKey}`,
        },
        body: kieFormData,
      });

      if (!kieResponse.ok) {
        const errorBody = await kieResponse.json().catch(() => ({}));
        console.error('KIE upload error:', errorBody);
        return NextResponse.json(
          { error: 'Failed to upload file to KIE' },
          { status: 502 }
        );
      }

      const kieData = await kieResponse.json();
      console.log('KIE upload response:', JSON.stringify(kieData));

      const fileUrl = kieData?.data?.fileUrl
        ?? kieData?.data?.url
        ?? kieData?.data?.downloadUrl
        ?? (typeof kieData?.data === 'string' ? kieData.data : null);

      if (!fileUrl) {
        console.error('KIE upload: could not find file URL in response:', kieData);
        return NextResponse.json(
          { error: 'Invalid response from KIE upload', details: kieData },
          { status: 502 }
        );
      }

      urls.push(fileUrl);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed, please try again' },
      { status: 500 }
    );
  }
}