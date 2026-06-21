import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const months = searchParams.get('months') || '12';

  try {
    const response = await backendFetch(`/dashboard/calendar/occupancy?months=${months}`, {}, true);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Occupancy error:', error);
    return NextResponse.json([]);
  }
}
