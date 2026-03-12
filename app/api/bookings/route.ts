import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '20';
  const status = searchParams.get('status');

  try {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', limit);
    if (status) params.set('status', status);

    const response = await fetch(`${API_URL}/bookings?${params}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Bookings API error:', error);
    return NextResponse.json({ data: [], meta: { page: 1, limit: 20, total: 0 } });
  }
}
