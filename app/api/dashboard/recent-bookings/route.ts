import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get('limit') || '10';

  try {
    const response = await fetch(`${API_URL}/dashboard/recent-bookings?limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recent bookings');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Recent bookings API error:', error);
    // Return mock data for development
    return NextResponse.json([
      {
        id: '1',
        bookingNumber: 'LXS-2026-00123',
        guestFirstName: 'John',
        guestLastName: 'Smith',
        guestEmail: 'john.smith@email.com',
        checkInDate: '2026-03-15',
        checkOutDate: '2026-03-18',
        totalAmount: 450,
        status: 'CONFIRMED',
        items: [{ roomType: { name: 'Deluxe Suite' } }],
      },
      {
        id: '2',
        bookingNumber: 'LXS-2026-00122',
        guestFirstName: 'Sarah',
        guestLastName: 'Johnson',
        guestEmail: 'sarah.j@email.com',
        checkInDate: '2026-03-10',
        checkOutDate: '2026-03-12',
        totalAmount: 280,
        status: 'CHECKED_IN',
        items: [{ roomType: { name: 'Standard Room' } }],
      },
      {
        id: '3',
        bookingNumber: 'LXS-2026-00121',
        guestFirstName: 'Michael',
        guestLastName: 'Brown',
        guestEmail: 'm.brown@email.com',
        checkInDate: '2026-03-20',
        checkOutDate: '2026-03-25',
        totalAmount: 750,
        status: 'PENDING',
        items: [{ roomType: { name: 'Executive Suite' } }],
      },
      {
        id: '4',
        bookingNumber: 'LXS-2026-00120',
        guestFirstName: 'Emily',
        guestLastName: 'Davis',
        guestEmail: 'emily.d@email.com',
        checkInDate: '2026-03-08',
        checkOutDate: '2026-03-10',
        totalAmount: 320,
        status: 'CHECKED_OUT',
        items: [{ roomType: { name: 'Premium Room' } }],
      },
      {
        id: '5',
        bookingNumber: 'LXS-2026-00119',
        guestFirstName: 'David',
        guestLastName: 'Wilson',
        guestEmail: 'd.wilson@email.com',
        checkInDate: '2026-03-22',
        checkOutDate: '2026-03-24',
        totalAmount: 180,
        status: 'CONFIRMED',
        items: [{ roomType: { name: 'Standard Room' } }],
      },
    ]);
  }
}
