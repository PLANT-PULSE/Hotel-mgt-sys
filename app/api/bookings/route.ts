import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-api';

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

    const response = await backendFetch(`/bookings?${params}`, {}, true);

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await backendFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify(body),
    }, false);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 },
    );
  }
}
