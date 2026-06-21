import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-api';

export async function GET() {
  try {
    const [roomsResponse, dashboardResponse] = await Promise.all([
      backendFetch('/rooms/inventory/list', {}, true),
      backendFetch('/dashboard/stats', {}, true),
    ]);

    let roomCount = 0;
    let roomStatus = { available: 0, occupied: 0, cleaning: 0, maintenance: 0 };

    if (roomsResponse.ok) {
      const rooms = await roomsResponse.json();
      roomCount = rooms.length;
      roomStatus = {
        available: rooms.filter((r: { status: string }) => r.status === 'AVAILABLE').length,
        occupied: rooms.filter((r: { status: string }) => r.status === 'OCCUPIED').length,
        cleaning: rooms.filter((r: { status: string }) => r.status === 'CLEANING').length,
        maintenance: rooms.filter((r: { status: string }) => r.status === 'MAINTENANCE').length,
      };
    }

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
