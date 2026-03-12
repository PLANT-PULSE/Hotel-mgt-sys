import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const days = searchParams.get('days') || '30';

  try {
    const response = await fetch(`${API_URL}/dashboard/analytics/daily-bookings?days=${days}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Return mock data
    const mockData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      mockData.push({
        date: d.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10) + 1,
      });
    }
    return NextResponse.json(mockData);
  }
}
