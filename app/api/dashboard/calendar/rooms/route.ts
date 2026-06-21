import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    const response = await backendFetch(`/dashboard/calendar/rooms?${params}`, {}, true);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Calendar rooms error:', error);
    return NextResponse.json([]);
  }
}
