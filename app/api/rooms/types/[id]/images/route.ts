import { NextRequest, NextResponse } from 'next/server';
import { backendBaseUrl, backendFetchWithAuth } from '@/lib/backend';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // Limit to 3 images
    const imagesToUpload = files.slice(0, 3);

    // Convert File objects to buffers and create form data for the backend
    const backendFormData = new FormData();
    
    for (const file of imagesToUpload) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const blob = new Blob([buffer], { type: file.type });
      backendFormData.append('images', blob, file.name);
    }

    const accessToken = request.cookies.get('accessToken')?.value;
    const response = await fetch(`${backendBaseUrl()}/rooms/${id}/images`, {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      body: backendFormData,
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id, imageId } = await params;
    const { res, setCookies } = await backendFetchWithAuth(
      request,
      `/rooms/${id}/images/${imageId}`,
      { method: 'DELETE' },
    );

    const text = await res.text();
    const out = new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
    });
    if (setCookies) {
      out.cookies.set('accessToken', setCookies.accessToken, { httpOnly: true, sameSite: 'lax', path: '/' });
      out.cookies.set('refreshToken', setCookies.refreshToken, { httpOnly: true, sameSite: 'lax', path: '/' });
    }
    return out;
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
