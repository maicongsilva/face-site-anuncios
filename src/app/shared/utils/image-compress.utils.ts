export const MAX_IMAGES_PER_ANUNCIO = 6;
// Margem abaixo do limite de 10 MB do servidor para o overhead do multipart.
export const MAX_UPLOAD_TOTAL_BYTES = 9 * 1024 * 1024;

const MAX_DIMENSION = 1920;
const QUALITY = 0.92;

export async function compressImage(file: File): Promise<File> {
  // GIFs podem ser animados; o canvas perderia a animação.
  if (file.type === 'image/gif') {
    return file;
  }

  try {
    const image = await loadImage(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, width, height);

    let blob = await toBlob(canvas, 'image/webp');
    if (!blob || blob.type !== 'image/webp') {
      // Navegadores sem suporte a WebP: JPEG não tem transparência, então usa fundo branco.
      context.globalCompositeOperation = 'destination-over';
      context.fillStyle = '#fff';
      context.fillRect(0, 0, width, height);
      blob = await toBlob(canvas, 'image/jpeg');
    }

    if (!blob || (scale === 1 && blob.size >= file.size)) {
      return file;
    }

    const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'imagem';
    return new File([blob], `${baseName}.${extension}`, { type: blob.type, lastModified: Date.now() });
  } catch {
    return file;
  }
}

export function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Falha ao ler a imagem.'));
    };
    image.src = url;
  });
}
