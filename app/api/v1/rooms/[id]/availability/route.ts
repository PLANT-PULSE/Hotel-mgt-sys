import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AvailabilityRequest {
  checkInDate: string;
  checkOutDate: string;
  quantity?: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: AvailabilityRequest = await request.json();
    const { checkInDate, checkOutDate, quantity = 1 } = body;

    // Validate input
    if (!checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'checkInDate and checkOutDate are required' },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: 'checkOutDate must be after checkInDate' },
        { status: 400 }
      );
    }

    // Fetch room and check availability
    const room = await prisma.roomType.findUnique({
      where: { id },
      select: {
        totalUnits: true,
        id: true,
        name: true,
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Count booked units for the date range
    const bookedUnits = await prisma.bookingItem.count({
      where: {
        roomTypeId: id,
        booking: {
          status: {
            in: ['CONFIRMED', 'CHECKED_IN'],
          },
          checkInDate: {
            lt: checkOut,
          },
          checkOutDate: {
            gt: checkIn,
          },
        },
      },
    });

    const availableUnits = room.totalUnits - bookedUnits;
    const isAvailable = availableUnits >= quantity;

    return NextResponse.json(
      {
        roomId: id,
        roomName: room.name,
        checkInDate,
        checkOutDate,
        requestedQuantity: quantity,
        totalUnits: room.totalUnits,
        bookedUnits,
        availableUnits,
        isAvailable,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
