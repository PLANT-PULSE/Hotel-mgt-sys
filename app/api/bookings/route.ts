import { NextRequest } from 'next/server';
import { proxyJson } from '@/lib/backend';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '20';
  const status = searchParams.get('status');

  const params = new URLSearchParams();
  params.set('page', page);
  params.set('limit', limit);
  if (status) params.set('status', status);

  return proxyJson(request, `/bookings?${params.toString()}`, { method: 'GET' });
}
