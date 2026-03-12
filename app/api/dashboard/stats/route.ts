import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET() {
  try {
    // Fetch rooms to calculate stats
    const roomsResponse = await fetch(`${API_URL}/rooms/inventory/list`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    
    const dashboardResponse = await fetch(`${API_URL}/dashboard/stats`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    let roomCount = 0;
    let roomStatus = { available: 0, occupied: 0, cleaning: 0, maintenance: 0 };
    
    // Get room stats from rooms endpoint
    if (roomsResponse.ok) {
      const rooms = await roomsResponse.json();
      roomCount = rooms.length;
      roomStatus = {
        available: rooms.filter((r: any) => r.status === 'AVAILABLE').length,
        occupied: rooms.filter((r: any) => r.status === 'OCCUPIED').length,
        cleaning: rooms.filter((r: any) => r.status === 'CLEANING').length,
        maintenance: rooms.filter((r: any) => r.status === 'MAINTENANCE').length,
      };
    }

    // Try to get dashboard stats, fallback to room-based stats
    if (dashboardResponse.ok) {
      const data = await dashboardResponse.json();
      return NextResponse.json({
        ...data,
        totalRooms: roomCount || data.totalRooms,
        roomStatus: roomCount > 0 ? roomStatus : (data.roomStatus || roomStatus),
      });
    }
    
    throw new Error('Failed to fetch dashboard stats');
  } catch (error) {
    console.error('Dashboard stats error:', error);
    // Return empty/zero stats when no data available
    return NextResponse.json({
      monthlyRevenue: 0,
      totalRevenue: 0,
      totalBookings: 0,
      occupancyRate: 0,
      totalCustomers: 0,
      totalRooms: 0,
      roomStatus: {
        available: 0,
        occupied: 0,
        cleaning: 0,
        maintenance: 0,
      },
    });
  }
}
