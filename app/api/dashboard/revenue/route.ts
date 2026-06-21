import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const months = searchParams.get('months') || '6';

  try {
    const response = await backendFetch(`/dashboard/revenue?months=${months}`, {}, true);

    if (!response.ok) {
      throw new Error('Failed to fetch revenue data');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Revenue API error:', error);
    return NextResponse.json([]);
  }
}
