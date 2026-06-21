import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '20';

  try {
    const response = await backendFetch(`/guests?page=${page}&limit=${limit}`, {}, true);

    if (!response.ok) {
      throw new Error('Failed to fetch guests');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Guests API error:', error);
    return NextResponse.json({ data: [], meta: { page: 1, limit: 20, total: 0 } });
  }
}
