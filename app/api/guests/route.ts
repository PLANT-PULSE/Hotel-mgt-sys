import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '20';

  try {
    const response = await fetch(`${API_URL}/guests?page=${page}&limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

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
