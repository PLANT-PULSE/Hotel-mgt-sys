import { NextRequest } from 'next/server';
import { proxyJson } from '@/lib/backend';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const months = searchParams.get('months') || '6';

  return proxyJson(request, `/dashboard/revenue?months=${encodeURIComponent(months)}`, {
    method: 'GET',
  });
}
