import { toThumbnailUrl } from './thumbnail.utils';

describe('toThumbnailUrl', () => {
  const cloud = 'https://res.cloudinary.com/demo/image/upload/v123/anuncios/foto.jpg';

  it('adds a resize transformation to Cloudinary URLs', () => {
    expect(toThumbnailUrl(cloud, 400)).toBe(
      'https://res.cloudinary.com/demo/image/upload/w_400,c_limit,f_auto,q_auto:good/v123/anuncios/foto.jpg'
    );
  });

  it('does not transform twice', () => {
    const once = toThumbnailUrl(cloud) as string;
    expect(toThumbnailUrl(once)).toBe(once);
  });

  it('keeps local and empty URLs unchanged', () => {
    expect(toThumbnailUrl('http://localhost/uploads/anuncios/a.webp')).toBe('http://localhost/uploads/anuncios/a.webp');
    expect(toThumbnailUrl(undefined)).toBeUndefined();
  });
});
