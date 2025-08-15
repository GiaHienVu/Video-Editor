import fs from 'fs';
import path from 'path';

export class StorageService {
  // ...existing code...

  async removeFile(absPath: string): Promise<void> {
    try {
      await fs.promises.unlink(absPath);
    } catch (e: any) {
      if (e?.code !== 'ENOENT') throw e; // bỏ qua nếu không tồn tại
    }
  }
}