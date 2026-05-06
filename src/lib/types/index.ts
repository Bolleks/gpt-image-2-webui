export type TaskStatus =
  | 'waiting'
  | 'queuing'
  | 'generating'
  | 'success'
  | 'fail'
  | 'timeout'
  | 'download_failed'
  | 'expired';

export type AspectRatio = 'auto' | '1:1' | '9:16' | '16:9' | '4:3' | '3:4';

export type Resolution = '1K' | '2K' | '4K';

export interface GenerateRequest {
  prompt: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  inputUrls?: string[];
}

export interface TaskResponse {
  taskId: string;
  status: TaskStatus;
  progress: number | null;
  imageUrl: string | null;
  failMsg: string | null;
  costTime: number | null;
}

export interface CreditsResponse {
  credits: number;
}
