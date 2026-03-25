import { NextRequest } from 'next/server';
import { proxyJson } from '@/lib/backend';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const roomTypeId = searchParams.get('roomTypeId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const params = new URLSearchParams();
  if (roomTypeId) params.set('roomTypeId', roomTypeId);
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);

  return proxyJson(request, `/calendar/availability?${params.toString()}`, { method: 'GET' });
}

