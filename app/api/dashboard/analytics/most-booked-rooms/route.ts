import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-api';

export async function GET() {
  try {
    const response = await backendFetch('/dashboard/analytics/most-booked-rooms', {}, true);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Most booked rooms error:', error);
    return NextResponse.json([]);
  }
}
