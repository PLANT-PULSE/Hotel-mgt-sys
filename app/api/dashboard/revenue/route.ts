import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const months = searchParams.get('months') || '6';

  try {
    const response = await fetch(`${API_URL}/dashboard/revenue?months=${months}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch revenue data');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Revenue API error:', error);
    // Return mock data for development
    return NextResponse.json([
      { month: 'Sep 25', revenue: 32500 },
      { month: 'Oct 25', revenue: 45200 },
      { month: 'Nov 25', revenue: 38900 },
      { month: 'Dec 25', revenue: 52100 },
      { month: 'Jan 26', revenue: 48700 },
      { month: 'Feb 26', revenue: 45250 },
    ]);
  }
}
