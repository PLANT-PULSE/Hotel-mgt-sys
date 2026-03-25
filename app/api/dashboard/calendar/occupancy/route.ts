import { NextRequest } from 'next/server';
import { proxyJson } from '@/lib/backend';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const months = searchParams.get('months') || '12';

  return proxyJson(
    request,
    `/dashboard/calendar/occupancy?months=${encodeURIComponent(months)}`,
    { method: 'GET' },
  );
}
