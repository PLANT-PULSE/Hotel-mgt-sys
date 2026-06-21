import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const roomTypeId = searchParams.get('roomTypeId');
  const checkInDate = searchParams.get('checkInDate');
  const checkOutDate = searchParams.get('checkOutDate');

  if (!roomTypeId || !checkInDate || !checkOutDate) {
    return NextResponse.json(
      { error: 'roomTypeId, checkInDate, and checkOutDate are required' },
      { status: 400 },
    );
  }

  try {
    const params = new URLSearchParams({
      roomTypeId,
      checkInDate,
      checkOutDate,
    });

    const response = await backendFetch(`/bookings/availability?${params}`, {}, false);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Availability check error:', error);
    return NextResponse.json(
      { available: false, availableQuantity: 0, lockedQuantity: 0 },
      { status: 500 },
    );
  }
}
