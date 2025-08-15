export class DimensionService {
  // Không upscale, ép số chẵn để tránh lỗi H.264
  clampNoUpscale(srcW: number, srcH: number, reqW = 1280, reqH = 720) {
    let w = Math.min(reqW || 1280, srcW);
    let h = Math.min(reqH || 720, srcH);
    if (w % 2) w -= 1;
    if (h % 2) h -= 1;
    if (w < 2) w = 2;
    if (h < 2) h = 2;
    return { w, h };
  }
}