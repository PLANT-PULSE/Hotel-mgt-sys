import { NextRequest, NextResponse } from 'next/server';
import { backendBaseUrl, proxyJson, backendFetchWithAuth } from '@/lib/backend';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);

  const qs = params.toString();
  return proxyJson(request, `/rooms${qs ? `?${qs}` : ''}`, { method: 'GET' });
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
      const { res: response, setCookies } = await backendFetchWithAuth(request, '/rooms', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        return NextResponse.json(error, { status: response.status });
      }

      const newRoomType = await response.json();
      const out = NextResponse.json(newRoomType);
      if (setCookies) {
        out.cookies.set('accessToken', setCookies.accessToken, { httpOnly: true, sameSite: 'lax', path: '/' });
        out.cookies.set('refreshToken', setCookies.refreshToken, { httpOnly: true, sameSite: 'lax', path: '/' });
      }
      
      // If there are images, upload them
      if (imagesToUpload.length > 0) {
        const backendFormData = new FormData();
        
        for (const file of imagesToUpload) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const blob = new Blob([buffer], { type: file.type });
          backendFormData.append('images', blob, file.name);
        }

        const accessToken = request.cookies.get('accessToken')?.value;
        await fetch(`${backendBaseUrl()}/rooms/${newRoomType.id}/images`, {
          method: 'POST',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
          body: backendFormData,
        });
      }
      
      return out;
    } else {
      // Regular JSON request
      const body = await request.json();
      return proxyJson(request, '/rooms', { method: 'POST', body: JSON.stringify(body) });
    }
  } catch (error) {
    console.error('Create room type error:', error);
    return NextResponse.json(
      { error: 'Failed to create room type' },
      { status: 500 }
    );
  }
}
