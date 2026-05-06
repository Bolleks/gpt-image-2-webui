import crypto from 'crypto';

export interface WebhookPayload {
  taskId: string;
  code: number;
  msg: string;
  data: {
    task_id: string;
    callbackType: string;
    [key: string]: unknown;
  };
}

export class WebhookVerifier {
  private hmacKey: string;

  constructor(hmacKey: string) {
    this.hmacKey = hmacKey;
  }

  verify(
    taskId: string,
    timestamp: string,
    receivedSignature: string
  ): boolean {
    const dataToSign = `${taskId}.${timestamp}`;

    const computedSignature = crypto
      .createHmac('sha256', this.hmacKey)
      .update(dataToSign)
      .digest('base64');

    if (computedSignature.length !== receivedSignature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(computedSignature),
      Buffer.from(receivedSignature)
    );
  }

  isTimestampValid(timestamp: string, windowSeconds: number = 300): boolean {
    const now = Math.floor(Date.now() / 1000);
    const ts = parseInt(timestamp, 10);
    return Math.abs(now - ts) <= windowSeconds;
  }
}
