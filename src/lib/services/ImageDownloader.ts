import fs from 'fs';
import path from 'path';
import { KieApiClient } from './KieApiClient';

export class ImageDownloader {
  private storagePath: string;
  private kieClient: KieApiClient;

  constructor(storagePath: string, kieClient: KieApiClient) {
    this.storagePath = storagePath;
    this.kieClient = kieClient;
  }

  async downloadAndSave(resultUrl: string, taskId: string): Promise<string> {
    const downloadUrl = await this.kieClient.getDownloadUrl(resultUrl);

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');

    const dateDir = path.join(this.storagePath, year, month, day);
    fs.mkdirSync(dateDir, { recursive: true });

    const ext = this.getExtensionFromUrl(downloadUrl);
    const fileName = `${taskId}${ext}`;
    const filePath = path.join(dateDir, fileName);

    fs.writeFileSync(filePath, buffer);

    return filePath;
  }

  private getExtensionFromUrl(url: string): string {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const ext = path.extname(pathname);
    return ext || '.png';
  }

  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  getFileBuffer(filePath: string): Buffer {
    return fs.readFileSync(filePath);
  }

  getFileMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };
    return mimeTypes[ext] || 'image/png';
  }
}
