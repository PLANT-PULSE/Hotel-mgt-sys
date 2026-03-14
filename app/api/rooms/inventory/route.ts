import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');

  try {
    const params = new URLSearchParams();
    if (status) params.set('status', status);

    const response = await fetch(`${API_URL}/rooms/inventory/list?${params}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const data = await response.json();
    
    // Enhance room data with images from room types
    const enhancedData = data.map((room: any) => ({
      ...room,
      roomType: {
        ...room.roomType,
        images: room.roomType?.images || [],
      },
    }));
    
    return NextResponse.json(enhancedData);
  } catch (error) {
    // Return empty array if backend is not available - no mock data
    return NextResponse.json([]);
  }
}
