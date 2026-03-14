import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

    const response = await fetch(`${API_URL}/rooms?${params}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Return empty array if backend is not available - no mock data
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
      const response = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

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

        await fetch(`${API_URL}/rooms/${newRoomType.id}/images`, {
          method: 'POST',
          body: backendFormData,
        });
      }
      
      return NextResponse.json(newRoomType);
    } else {
      // Regular JSON request
      const body = await request.json();
      
      const response = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

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
