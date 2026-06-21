import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const days = searchParams.get('days') || '30';

  try {
    const response = await backendFetch(`/dashboard/analytics/daily-bookings?days=${days}`, {}, true);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Daily bookings error:', error);
    return NextResponse.json([]);
  }
}
