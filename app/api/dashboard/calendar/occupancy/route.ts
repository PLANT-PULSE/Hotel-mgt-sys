import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const months = searchParams.get('months') || '12';

  try {
    const response = await fetch(`${API_URL}/dashboard/calendar/occupancy?months=${months}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Occupancy error:', error);
    return NextResponse.json([]);
  }
}
