import { join } from 'path';
import { unlink } from 'fs/promises';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';

const UPLOAD_DIR = join(process.cwd(), 'data', 'uploads');

export class KieApiError extends Error {
  constructor(
    message: string,
    public code: number
  ) {
    super(message);
    this.name = 'KieApiError';
  }
}

interface CreateTaskParams {
  prompt: string;
  aspectRatio: string;
  resolution: string;
  callBackUrl?: string;
  inputUrls?: string[];
}

export class KieApiClient {
  private baseUrl = 'https://api.kie.ai/api/v1/jobs';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  static async fromDb(): Promise<KieApiClient> {
    const result = await db.query.settings.findFirst({
      where: (s, { eq }) => eq(s.id, 'default'),
    });

    if (!result) {
      throw new Error('No settings found in database');
    }

    return new KieApiClient(result.apiKey);
  }

  async createTask(params: CreateTaskParams): Promise<string> {
    const isImageToImage = params.inputUrls && params.inputUrls.length > 0;

    const response = await fetch(`${this.baseUrl}/createTask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: isImageToImage ? 'gpt-image-2-image-to-image' : 'gpt-image-2-text-to-image',
        callBackUrl: params.callBackUrl,
        input: {
          prompt: params.prompt,
          aspect_ratio: params.aspectRatio,
          resolution: params.resolution,
          ...(isImageToImage && { input_urls: params.inputUrls }),
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new KieApiError(
        errorBody.msg || errorBody.message || response.statusText,
        response.status
      );
    }

    const data = (await response.json()) as { code: number; msg?: string; data: { taskId: string } };
    if (data.code !== 200 || !data.data?.taskId) {
      throw new KieApiError(
        data.msg || 'Failed to create task',
        data.code || 500
      );
    }
    return data.data.taskId;
  }

  async getDownloadUrl(resultUrl: string): Promise<string> {
    const response = await fetch('https://api.kie.ai/api/v1/common/download-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ url: resultUrl }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new KieApiError(
        errorBody.msg || errorBody.message || response.statusText,
        response.status
      );
    }

    const data = (await response.json()) as { code: number; msg?: string; data: string };
    if (data.code !== 200) {
      throw new KieApiError(
        data.msg || 'Failed to get download URL',
        data.code || 500
      );
    }
    if (!data.data || typeof data.data !== 'string') {
      throw new KieApiError('No download URL in response', 500);
    }
    return data.data;
  }

  async getTaskStatus(taskId: string): Promise<{
    status: string;
    resultUrl?: string;
    failCode?: string;
    failMsg?: string;
    costTime?: number;
  }> {
    const response = await fetch(`${this.baseUrl}/getTaskStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ taskId }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new KieApiError(
        errorBody.msg || errorBody.message || response.statusText,
        response.status
      );
    }

    return response.json();
  }

  async getCredits(): Promise<number> {
    const response = await fetch('https://api.kie.ai/api/v1/chat/credit', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new KieApiError(
        errorBody.msg || errorBody.message || response.statusText,
        response.status
      );
    }

    const data = (await response.json()) as { code: number; data: number };
    if (data.code !== 200) {
      throw new KieApiError(`Credits API returned error: ${data.code}`, data.code);
    }
    return data.data;
  }

  async getTaskDetails(taskId: string): Promise<{
    taskId: string;
    model: string;
    state: string;
    param: string;
    resultJson: string;
    failCode: string;
    failMsg: string;
    costTime: number;
    progress: number | null;
  }> {
    const response = await fetch(
      `${this.baseUrl}/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new KieApiError(
        errorBody.msg || errorBody.message || response.statusText,
        response.status
      );
    }

    const data = (await response.json()) as {
      code: number;
      data: {
        taskId: string;
        model: string;
        state: string;
        param: string;
        resultJson: string;
        failCode: string;
        failMsg: string;
        costTime: number;
        progress?: number;
      };
    };

    if (data.code !== 200) {
      throw new KieApiError(`Task details API returned error: ${data.code}`, data.code);
    }

    return {
      ...data.data,
      progress: data.data.progress ?? null,
    };
  }
}

export async function deleteUploadedFile(url: string): Promise<void> {
  try {
    const filename = url.split('/').pop();
    if (!filename) return;

    const filepath = join(UPLOAD_DIR, filename);

    if (!filepath.startsWith(UPLOAD_DIR)) {
      console.error('Invalid file path:', filepath);
      return;
    }

    await unlink(filepath);
  } catch (error) {
    console.error('Failed to delete uploaded file:', error);
  }
}
