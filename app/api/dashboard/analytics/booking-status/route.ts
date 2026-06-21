import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-api';

export async function GET() {
  try {
    const response = await backendFetch('/dashboard/analytics/booking-status', {}, true);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Booking status error:', error);
    return NextResponse.json([]);
  }
}
