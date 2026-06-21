import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-api';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const response = await backendFetch(`/bookings/reservation-lock/${token}`, {
      method: 'DELETE',
    }, false);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Release lock error:', error);
    return NextResponse.json(
      { error: 'Failed to release reservation hold' },
      { status: 500 },
    );
  }
}
