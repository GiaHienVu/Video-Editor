// video.entity.ts

export enum VideoStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class Video {
  readonly videoId: bigint;
  readonly userId: bigint;
  readonly fileName: string;
  readonly filePath: string;
  readonly fileSize: bigint;
  readonly format: string;
  readonly status: VideoStatus;
  readonly uploadedAt: Date;

  private constructor(props: {
    videoId: bigint,
    userId: bigint,
    fileName: string,
    filePath: string,
    fileSize: bigint,
    format: string,
    status: VideoStatus,
    uploadedAt: Date,
  }) {
    this.videoId = props.videoId;
    this.userId = props.userId;
    this.fileName = props.fileName;
    this.filePath = props.filePath;
    this.fileSize = props.fileSize;
    this.format = props.format;
    this.status = props.status;
    this.uploadedAt = props.uploadedAt;
  }

  /**
   * Factory method để khôi phục một entity Video từ record trong database
   */
  static restore(video : Video): Video {
    return new Video({
      videoId: BigInt(video.videoId),
      userId: BigInt(video.userId),
      fileName: video.fileName,
      filePath: video.filePath,
      fileSize: BigInt(video.fileSize),
      format: video.format,
      status: video.status as VideoStatus,
      uploadedAt: new Date(video.uploadedAt),
    });
  }
}
