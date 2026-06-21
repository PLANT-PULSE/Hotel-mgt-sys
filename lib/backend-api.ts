const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAdminToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.SUPER_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'superadmin@platform.com',
      password: process.env.SUPER_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'Password123!',
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with backend');
  }

  const data = await response.json();
  cachedToken = data.tokens?.accessToken || data.accessToken;
  if (!cachedToken) {
    throw new Error('Backend login did not return an access token');
  }
  tokenExpiry = Date.now() + 14 * 60 * 1000;
  return cachedToken!;
}

export async function backendFetch(
  path: string,
  options: RequestInit = {},
  requireAuth = false,
): Promise<Response> {
  const headers = new Headers(options.headers);

  if (requireAuth) {
    headers.set('Authorization', `Bearer ${await getAdminToken()}`);
  }

  if (options.body && !headers.has('Content-Type') && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });
}

export function mapRoomTypeForAdmin(roomType: Record<string, unknown>) {
  const images = (roomType.images as { url: string; isPrimary: boolean }[] | undefined) || [];
  const fallbackImage = roomType.image
    ? [{ url: roomType.image as string, isPrimary: true }]
    : [];

  return {
    ...roomType,
    basePrice: Number(roomType.basePrice),
    maxOccupancy: roomType.maxGuests,
    bedType: `${roomType.beds} bed${Number(roomType.beds) > 1 ? 's' : ''}`,
    images: images.length > 0 ? images : fallbackImage,
  };
}

export function mapInventoryRoom(room: Record<string, unknown>) {
  const roomType = room.roomType as Record<string, unknown> | undefined;

  return {
    ...room,
    roomNumber: room.number,
    roomType: roomType ? mapRoomTypeForAdmin(roomType) : roomType,
  };
}

export { API_BASE };
