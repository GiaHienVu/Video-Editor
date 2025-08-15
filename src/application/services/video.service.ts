import ffmpeg from 'fluent-ffmpeg';

export class VideoService {
  probe(inputPath: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, data) => {
        if (err) return reject(err);
        const s = data.streams.find((st) => (st as any).width && (st as any).height) as any;
        resolve({ width: s?.width ?? 0, height: s?.height ?? 0 });
      });
    });
  }

  resize(inputPath: string, outputPath: string, w: number, h: number, signal?: AbortSignal): Promise<void> {
    const scale = `scale=${w}:${h}:force_original_aspect_ratio=decrease`;
    return new Promise((resolve, reject) => {
      let aborted = false;
      const cmd = ffmpeg(inputPath)
        .outputOptions(['-vf', scale])
        .on('end', () => resolve())
        .on('error', (err) => {
          if (aborted) return reject(new Error('AbortError'));
          reject(err);
        })
        .save(outputPath);

      const onAbort = () => {
        aborted = true;
        try { (cmd as any)?.kill?.('SIGKILL'); } catch {}
      };
      if (signal) {
        if (signal.aborted) return onAbort(), reject(new Error('AbortError'));
        signal.addEventListener('abort', onAbort, { once: true });
      }
    });
  }
}