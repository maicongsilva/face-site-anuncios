import { compressImage } from './image-compress.utils';

describe('compressImage', () => {
  async function createPngFile(width: number, height: number): Promise<File> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d')!;
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#2563eb');
    gradient.addColorStop(1, '#f97316');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
    return new File([blob], 'foto grande.png', { type: 'image/png' });
  }

  it('should downscale large images and reduce their size', async () => {
    const original = await createPngFile(3200, 2400);

    const result = await compressImage(original);

    expect(result.size).toBeLessThan(original.size);
    expect(['image/webp', 'image/jpeg']).toContain(result.type);

    const bitmap = await createImageBitmap(result);
    expect(Math.max(bitmap.width, bitmap.height)).toBeLessThanOrEqual(1600);
  });

  it('should return GIF files untouched', async () => {
    const gif = new File([new Uint8Array([71, 73, 70, 56, 57, 97])], 'anim.gif', { type: 'image/gif' });

    expect(await compressImage(gif)).toBe(gif);
  });

  it('should return the original file when it cannot be decoded', async () => {
    const broken = new File(['not-an-image'], 'quebrada.png', { type: 'image/png' });

    expect(await compressImage(broken)).toBe(broken);
  });
});
