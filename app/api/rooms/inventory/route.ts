import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, mapInventoryRoom } from '@/lib/backend-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');

  try {
    const params = new URLSearchParams();
    if (status) params.set('status', status);

    const response = await backendFetch(`/rooms/inventory/list?${params}`, {}, true);
    const data = await response.json();
    const rooms = Array.isArray(data) ? data : [];

    return NextResponse.json(rooms.map((room) => mapInventoryRoom(room)));
  } catch (error) {
    return NextResponse.json([]);
  }
}
