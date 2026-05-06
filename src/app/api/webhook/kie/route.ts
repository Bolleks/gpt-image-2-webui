import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings, tasks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { KieApiClient } from '@/lib/services/KieApiClient';
import { ImageDownloader } from '@/lib/services/ImageDownloader';
import { WebhookVerifier } from '@/lib/services/WebhookVerifier';

export async function POST(request: NextRequest) {
  try {
    const row = await db.query.settings.findFirst({
      where: eq(settings.id, 'default'),
    });

    if (!row) {
      return NextResponse.json(
        { error: 'Settings not configured' },
        { status: 500 }
      );
    }

    const timestamp = request.headers.get('x-webhook-timestamp');
    const receivedSignature = request.headers.get('x-webhook-signature');

    if (timestamp && receivedSignature && row.webhookHmacKey) {
      const verifier = new WebhookVerifier(row.webhookHmacKey);

      if (!verifier.isTimestampValid(timestamp)) {
        return NextResponse.json(
          { error: 'Expired timestamp' },
          { status: 401 }
        );
      }

      const body = await request.json();
      const taskId = body.data?.task_id || body.taskId;

      if (taskId) {
        const isValid = verifier.verify(taskId, timestamp, receivedSignature);
        if (!isValid) {
          return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 401 }
          );
        }
      }
    }

    const body = await request.json();
    const taskId = body.data?.task_id || body.taskId;
    const code = body.code;

    if (!taskId) {
      return NextResponse.json({ error: 'Missing task_id' }, { status: 400 });
    }

    const kieClient = new KieApiClient(row.apiKey);
    const downloader = new ImageDownloader(row.storagePath, kieClient);

    if (code === 200) {
      const details = await kieClient.getTaskDetails(taskId);
      const resultJson = JSON.parse(details.resultJson || '{}');
      const resultUrl = resultJson.resultUrls?.[0];

      let localPath: string | undefined;
      if (resultUrl) {
        try {
          localPath = await downloader.downloadAndSave(resultUrl, taskId);
        } catch {
          await db
            .update(tasks)
            .set({
              status: 'download_failed',
              failCode: 'DOWNLOAD_FAILED',
              failMsg: 'Failed to download image',
              updatedAt: new Date(),
            })
            .where(eq(tasks.id, taskId));
          return NextResponse.json({ status: 'received' });
        }
      }

      await db
        .update(tasks)
        .set({
          status: 'success',
          resultUrl,
          localPath,
          costTime: details.costTime,
          updatedAt: new Date(),
          completedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));
    } else {
      await db
        .update(tasks)
        .set({
          status: 'fail',
          failCode: body.data?.failCode || String(code),
          failMsg: body.msg || 'Task failed',
          updatedAt: new Date(),
          completedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));
    }

    return NextResponse.json({ status: 'received' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
