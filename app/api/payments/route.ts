import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await backendFetch('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Payment checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 },
    );
  }
}
