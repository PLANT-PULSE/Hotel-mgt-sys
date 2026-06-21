const DEFAULT_ROOM_IMAGE =
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';

const API_ORIGIN =
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1').replace(
    /\/api\/v1\/?$/,
    '',
  );

export function resolveRoomImageUrl(url?: string | null): string {
  if (!url || url === '/placeholder.jpg') {
    return DEFAULT_ROOM_IMAGE;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('/uploads/')) {
    return `${API_ORIGIN}${url}`;
  }

  return url;
}

export function normalizeRoomImages(
  images: { url: string; isPrimary: boolean; id?: string }[] = [],
  legacyImage?: string | null,
) {
  const normalized =
    images.length > 0
      ? images
      : legacyImage
        ? [{ url: legacyImage, isPrimary: true }]
        : [];

  return normalized.map((img) => ({
    ...img,
    url: resolveRoomImageUrl(img.url),
  }));
}
