import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await backendFetch('/rooms/inventory', {
      method: 'POST',
      body: JSON.stringify(body),
    }, true);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 },
    );
  }
}
