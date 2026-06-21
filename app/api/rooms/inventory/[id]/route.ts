import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = await backendFetch(`/rooms/inventory/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }, true);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Update room status error:', error);
    return NextResponse.json(
      { error: 'Failed to update room status' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const response = await backendFetch(`/rooms/inventory/${id}`, {
      method: 'DELETE',
    }, true);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Delete room error:', error);
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 },
    );
  }
}
