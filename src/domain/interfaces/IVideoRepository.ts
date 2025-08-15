import { Video } from '../entities/video.entities';

export interface IVideoRepository {
  findById(videoId: bigint): Promise<Video | null>;
  findByUserId(userId: bigint): Promise<Video[]>;
  save(video: Video): Promise<Video>;  // sửa từ Promise<void> thành Promise<Video>
  delete(videoId: bigint): Promise<void>;
}
