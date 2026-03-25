import { NextRequest } from 'next/server';
import { proxyJson } from '@/lib/backend';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');

  const params = new URLSearchParams();
  if (status) params.set('status', status);
  const qs = params.toString();
  return proxyJson(request, `/rooms/inventory/list${qs ? `?${qs}` : ''}`, { method: 'GET' });
}
