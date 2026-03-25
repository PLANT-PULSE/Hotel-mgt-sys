import { NextRequest } from 'next/server';
import { proxyJson } from '@/lib/backend';

export async function GET(request: NextRequest) {
  return proxyJson(request, '/dashboard/analytics/most-booked-rooms', { method: 'GET' });
}
