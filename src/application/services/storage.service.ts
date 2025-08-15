import fs from 'fs';
import path from 'path';

export class StorageService {
  constructor(
    private baseDir = path.resolve(process.cwd(), 'uploads'),
    private processed = 'processed'
  ) {}

  ensureProcessedDir() {
    const dir = this.joinProcessed();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  joinProcessed(...p: string[]) { return path.join(this.baseDir, this.processed, ...p); }

  buildProcessedFilename(filename: string, w: number, h: number) {
    return `resized-${w}x${h}-${filename}`;
  }

  async removeFile(absPath: string): Promise<void> {
      try {
        await fs.promises.unlink(absPath);
      } catch (e: any) {
        if (e?.code !== 'ENOENT') throw e; // bỏ qua nếu không tồn tại
      }
    }

}