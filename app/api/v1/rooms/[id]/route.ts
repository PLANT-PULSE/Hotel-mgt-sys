import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch room details
    const room = await prisma.roomType.findUnique({
      where: { id },
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
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(room, { status: 200 });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}
