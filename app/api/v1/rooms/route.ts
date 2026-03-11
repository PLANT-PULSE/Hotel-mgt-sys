import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');

    // Fetch all room types with their details
    const rooms = await prisma.roomType.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        basePrice: true,
        size: true,
        maxGuests: true,
        beds: true,
        amenities: true,
        description: true,
        images: true,
        totalUnits: true,
        createdAt: true,
      },
      orderBy: {
        basePrice: 'asc',
      },
    });

    // If dates provided, check availability
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // For each room, count existing reservations for the date range
      const roomsWithAvailability = await Promise.all(
        rooms.map(async (room) => {
          const reservedCount = await prisma.booking.count({
            where: {
              items: {
                some: {
                  roomTypeId: room.id,
                },
              },
              status: {
                in: ['CONFIRMED', 'CHECKED_IN'],
              },
              checkInDate: {
                lt: checkOutDate,
              },
              checkOutDate: {
                gt: checkInDate,
              },
            },
          });

          return {
            ...room,
            available: room.totalUnits - reservedCount > 0,
            availableUnits: Math.max(0, room.totalUnits - reservedCount),
          };
        })
      );

      return NextResponse.json(roomsWithAvailability, { status: 200 });
    }

    // Return all rooms without availability info
    const roomsWithAvailability = rooms.map(room => ({
      ...room,
      available: room.totalUnits > 0,
      availableUnits: room.totalUnits,
    }));

    return NextResponse.json(roomsWithAvailability, { status: 200 });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}
