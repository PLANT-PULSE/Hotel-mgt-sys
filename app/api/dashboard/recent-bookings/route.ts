import { NextRequest } from 'next/server';
import { proxyJson } from '@/lib/backend';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get('limit') || '10';

  return proxyJson(
    request,
    `/dashboard/recent-bookings?limit=${encodeURIComponent(limit)}`,
    { method: 'GET' },
  );
}
