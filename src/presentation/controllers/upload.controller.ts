import { Request, Response, NextFunction } from 'express';
import { UploadVideoUseCase } from '../../application/use-cases/video/upload-video.usecase';
import { PrismaJobRepository } from '../../infrastructure/prisma/job';
import { VideoRepository } from '../../infrastructure/prisma/video';

export class VideoController {
  static async uploadVideo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      // Lấy userId từ middleware xác thực
      const userId =
        (req as any).user?.userId ??
        (req as any).user?.id ??
        (req as any).userId;
      if (userId == null) {
        return res.status(401).json({ error: 'Unauthorized: missing userId' });
      }

      const w = parseInt(String(req.body?.width ?? ''), 10);
      const h = parseInt(String(req.body?.height ?? ''), 10);
      const reqW = Number.isFinite(w) ? w : 1280;
      const reqH = Number.isFinite(h) ? h : 720;

      // 1) Tạo bản ghi video (quan hệ user required)
      const videos = new VideoRepository();
      const video = await videos.createFromUpload({
        fileName: req.file.filename,
        filePath: req.file.path,
        fileSize: req.file.size,
        format: req.file.mimetype,
        userId, // bắt buộc
      });
      const videoId = (video as any).videoId;

      // 2) Resize + tạo job (pending → running → succeeded|fail)
      const usecase = new UploadVideoUseCase(
        undefined,
        undefined,
        undefined,
        new PrismaJobRepository()
      );
      const processed = await usecase.execute(req.file, reqW, reqH, videoId);

      return res.status(201).json({
        message: 'File uploaded and resized successfully',
        videoId,
        file: processed,
      });
    } catch (error) {
      next(error);
    }
  }
}