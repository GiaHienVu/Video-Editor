import fs from 'fs/promises';
import { StorageService } from "../../services/storage.service";
import { DimensionService } from "../../services/dimension.service";
import { VideoService } from "../../services/video.service";
import { IJobRepository } from "../../../domain/interfaces/IJobRepository";
import { JobStatus } from "../../../domain/entities/job.entities";

type Result = {
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  resizedPath: string;
  sourceWidth: number;
  sourceHeight: number;
  width: number;
  height: number;
};

function anySignal(...signals: (AbortSignal | undefined)[]): AbortSignal | undefined {
  const list = signals.filter(Boolean) as AbortSignal[];
  if (!list.length) return undefined;
  const ac = new AbortController();
  const onAbort = () => {
    if (!ac.signal.aborted) ac.abort();
    cleanup();
  };
  const cleanup = () => list.forEach(s => s.removeEventListener('abort', onAbort));
  list.forEach(s => s.addEventListener('abort', onAbort));
  if (list.some(s => s.aborted)) onAbort();
  return ac.signal;
}

export class UploadVideoUseCase {
  constructor(
    private storage = new StorageService(),
    private dims = new DimensionService(),
    private video = new VideoService(),
    private jobs?: IJobRepository
  ) {}

  private async ensureNotCanceled(jobId: string | number | bigint | null) {
    if (!this.jobs || jobId == null) return;
    const job = await this.jobs.findById(jobId);
    if (job?.status === JobStatus.fail) {
      throw new Error('Job was canceled');
    }
  }

  async execute(
    file: Express.Multer.File,
    reqW?: number,
    reqH?: number,
    videoId?: string | number | bigint,
    externalSignal?: AbortSignal // truyền từ controller khi client abort
  ): Promise<Result> {
    this.storage.ensureProcessedDir();

    const meta = await this.video.probe(file.path);
    const { w, h } = this.dims.clampNoUpscale(meta.width, meta.height, reqW || 1280, reqH || 720);

    const outName = this.storage.buildProcessedFilename(file.filename, w, h);
    const outPath = this.storage.joinProcessed(outName);

    let jobId: string | number | bigint | null = null;

    // gộp signal: client abort + server-side cancel (poll → abort local)
    const localAC = new AbortController();
    const signal = anySignal(externalSignal, localAC.signal);

    // Poll DB để phát hiện job bị set fail bên ngoài và abort
    let pollTimer: NodeJS.Timeout | null = null;
    const startPolling = () => {
      if (!this.jobs) return;
      pollTimer = setInterval(async () => {
        if (!jobId || !this.jobs) return;
        try {
          const j = await this.jobs.findById(jobId);
          if (j?.status === JobStatus.fail && !localAC.signal.aborted) {
            localAC.abort(); // kích hoạt abort cho ffmpeg
          }
        } catch {
          // bỏ qua lỗi poll
        }
      }, 1000);
    };
    const stopPolling = () => {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = null;
    };

    try {
      // Tạo job
      if (this.jobs) {
        if (videoId == null) throw new Error("videoId is required to create a job");
        const job = await this.jobs.create({
          videoId,
          action: "resize",
          params: { input: file.path, output: outPath, width: w, height: h },
          status: JobStatus.pending,
        });
        jobId = job.jobId;
        await this.jobs.updateStatus(jobId, JobStatus.running);
        await this.ensureNotCanceled(jobId);
      }

      startPolling();

      if (signal?.aborted) throw new Error('AbortError');

      // Resize (có thể bị hủy giữa chừng)
      await this.video.resize(file.path, outPath, w, h, signal);

      // Đảm bảo file đã được ghi
      await fs.access(outPath);

      // Trước khi set succeeded, kiểm tra lại
      await this.ensureNotCanceled(jobId);
      if (signal?.aborted) throw new Error('AbortError');

      if (this.jobs && jobId != null) {
        await this.jobs.updateStatus(jobId, JobStatus.succeeded);
      }
    } catch (e) {
      // cập nhật fail và dọn rác
      if (this.jobs && jobId != null) {
        await this.jobs.update(jobId, {
          status: JobStatus.fail,
          params: { error: String(e) },
        });
      }
      await this.storage.removeFile(outPath);
      await this.storage.removeFile(file.path);
      throw e;
    } finally {
      stopPolling();
    }

    return {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      resizedPath: outPath,
      sourceWidth: meta.width,
      sourceHeight: meta.height,
      width: w,
      height: h,
    };
  }
}