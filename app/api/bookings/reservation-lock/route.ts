import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await backendFetch('/bookings/reservation-lock', {
      method: 'POST',
      body: JSON.stringify(body),
    }, false);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Reservation lock error:', error);
    return NextResponse.json(
      { error: 'Failed to create reservation hold' },
      { status: 500 },
    );
  }
}
