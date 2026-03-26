import { NextRequest, NextResponse } from 'next/server';
import { backendBaseUrl, backendFetchWithAuth } from '@/lib/backend';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { urls } = await request.json();

    if (!urls || urls.length === 0) {
      return NextResponse.json(
        { error: 'No image URLs provided' },
        { status: 400 }
      );
    }

    const { res, setCookies } = await backendFetchWithAuth(
      request,
      `/rooms/${id}/images/urls`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls }),
      }
    );

    const data = await res.json();
    const out = NextResponse.json(data, { status: res.status });
    
    // Pass along auth cookies if they were refreshed
    if (setCookies) {
      out.cookies.set('accessToken', setCookies.accessToken, { httpOnly: true, sameSite: 'lax', path: '/' });
      out.cookies.set('refreshToken', setCookies.refreshToken, { httpOnly: true, sameSite: 'lax', path: '/' });
    }
    
    return out;
  } catch (error: any) {
    console.error('URL save error:', error);
    return NextResponse.json(
      { error: `Failed to save images: ${error.message}` },
      { status: 500 }
    );
  }
}
