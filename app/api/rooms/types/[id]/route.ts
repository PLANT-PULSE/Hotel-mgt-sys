import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await backendFetch(`/rooms/${id}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Get room type error:', error);
    return NextResponse.json(
      { error: 'Failed to get room type' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = await backendFetch(`/rooms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }, true);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Update room type error:', error);
    return NextResponse.json(
      { error: 'Failed to update room type' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await backendFetch(`/rooms/${id}`, {
      method: 'DELETE',
    }, true);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Delete room type error:', error);
    return NextResponse.json(
      { error: 'Failed to delete room type' },
      { status: 500 }
    );
  }
}
