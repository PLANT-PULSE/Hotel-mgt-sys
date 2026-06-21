import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, mapRoomTypeForAdmin } from '@/lib/backend-api';
import { normalizeRoomImages } from '@/lib/room-images';

function mapRoomType(roomType: Record<string, unknown>) {
  const mapped = mapRoomTypeForAdmin(roomType);
  return {
    ...mapped,
    images: normalizeRoomImages(
      mapped.images as { url: string; isPrimary: boolean }[],
      roomType.image as string | undefined,
    ),
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  try {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    const response = await backendFetch(`/rooms?${params}`);
    const payload = await response.json();
    const roomTypes = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

    return NextResponse.json(
      roomTypes.map((roomType) => mapRoomType(roomType)),
    );
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    // Check if request contains multipart form data (with images)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const dataStr = formData.get('data') as string;
      const data = dataStr ? JSON.parse(dataStr) : {};
      
      // Handle image files
      const files = formData.getAll('images') as File[];
      const imagesToUpload = files.slice(0, 3);
      
      // First create the room type
      const response = await backendFetch('/rooms', {
        method: 'POST',
        body: JSON.stringify(data),
      }, true);

      if (!response.ok) {
        const error = await response.json();
        return NextResponse.json(error, { status: response.status });
      }

      const newRoomType = await response.json();
      
      // If there are images, upload them
      if (imagesToUpload.length > 0) {
        const backendFormData = new FormData();
        
        for (const file of imagesToUpload) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const blob = new Blob([buffer], { type: file.type });
          backendFormData.append('images', blob, file.name);
        }

        await backendFetch(`/rooms/${newRoomType.id}/images`, {
          method: 'POST',
          body: backendFormData,
        }, true);

        const refreshed = await backendFetch(`/rooms/${newRoomType.id}`);
        const refreshedData = await refreshed.json();
        return NextResponse.json(mapRoomType(refreshedData));
      }
      
      return NextResponse.json(mapRoomType(newRoomType));
    } else {
      // Regular JSON request
      const body = await request.json();
      
      const response = await backendFetch('/rooms', {
        method: 'POST',
        body: JSON.stringify(body),
      }, true);

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('Create room type error:', error);
    return NextResponse.json(
      { error: 'Failed to create room type' },
      { status: 500 }
    );
  }
}
