import  prisma  from './client';
import { Video } from '../../domain/entities/video.entities';
import { IVideoRepository } from '../../domain/interfaces/IVideoRepository';
import { VideoStatus as PrismaVideoStatus, Prisma } from '@prisma/client';

export class VideoRepository implements IVideoRepository {
  async findById(videoId: bigint): Promise<Video | null> {
    const result = await prisma.videos.findUnique({ where: { video_id: videoId } });
    if (!result) return null;
    return this.mapDbResultToVideoEntity(result);
  }

  async findByUserId(userId: bigint): Promise<Video[]> {
    const rows = await prisma.videos.findMany({ where: { user_id: userId } });
    return rows.map((r) => this.mapDbResultToVideoEntity(r));
  }

  // Tạo video từ upload và bắt buộc có userId (vì relation required)
  async createFromUpload(params: {
    fileName: string;
    filePath: string;
    fileSize: number;
    format: string;
    userId: string | number | bigint; // required
    status?: PrismaVideoStatus;
  }): Promise<Video> {
    const data: Prisma.VideosCreateInput = {
      file_name: params.fileName,
      file_path: params.filePath,
      file_size: BigInt(params.fileSize),
      format: params.format,
      status: params.status ?? (Object.values(PrismaVideoStatus)[0] as PrismaVideoStatus),
      user: { connect: { user_id: BigInt(params.userId as any) } }, // connect quan hệ bắt buộc
    };
    const result = await prisma.videos.create({ data });
    return this.mapDbResultToVideoEntity(result);
  }

  async save(video: Video): Promise<Video> {
    const result = await prisma.videos.create({
      data: {
        file_name: video.fileName!,
        file_path: video.filePath!,
        file_size: BigInt(video.fileSize!),
        format: video.format!,
        status: (video.status as unknown) as PrismaVideoStatus,
        uploaded_at: video.uploadedAt ?? new Date(),
        user: video.userId != null ? { connect: { user_id: BigInt(video.userId) } } : undefined as any,
      },
    });
    return this.mapDbResultToVideoEntity(result);
  }

  async delete(videoId: bigint): Promise<void> {
    await prisma.videos.delete({ where: { video_id: videoId } });
  }

  private mapDbResultToVideoEntity(result: any): Video {
    return Video.restore({
      videoId: result.video_id !== undefined ? BigInt(result.video_id) : undefined,
      userId: result.user_id !== undefined ? BigInt(result.user_id) : undefined,
      fileName: result.file_name,
      filePath: result.file_path,
      fileSize: result.file_size !== undefined ? BigInt(result.file_size) : undefined,
      format: result.format,
      status: result.status,
      uploadedAt: result.uploaded_at ? new Date(result.uploaded_at) : undefined,
    });
  }
}