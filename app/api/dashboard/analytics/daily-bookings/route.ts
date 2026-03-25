import { NextRequest } from 'next/server';
import { proxyJson } from '@/lib/backend';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const days = searchParams.get('days') || '30';

  return proxyJson(
    request,
    `/dashboard/analytics/daily-bookings?days=${encodeURIComponent(days)}`,
    { method: 'GET' },
  );
}
