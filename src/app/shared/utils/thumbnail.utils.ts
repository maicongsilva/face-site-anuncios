const CLOUDINARY_UPLOAD_SEGMENT = '/res.cloudinary.com/';

// Imagens do Cloudinary são redimensionadas na própria URL; as demais permanecem inalteradas.
export function toThumbnailUrl(url: string | undefined | null, width = 480): string | undefined {
  if (!url) {
    return undefined;
  }

  if (!url.includes(CLOUDINARY_UPLOAD_SEGMENT) || !url.includes('/image/upload/') || url.includes('/image/upload/w_')) {
    return url;
  }

  return url.replace('/image/upload/', `/image/upload/w_${width},c_limit,f_auto,q_auto/`);
}
