import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get('limit') || '10';

  try {
    const response = await backendFetch(`/dashboard/recent-bookings?limit=${limit}`, {}, true);

    if (!response.ok) {
      throw new Error('Failed to fetch recent bookings');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Recent bookings API error:', error);
    return NextResponse.json([]);
  }
}
