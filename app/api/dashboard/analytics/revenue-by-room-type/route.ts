import { NextRequest } from 'next/server';
import { proxyJson } from '@/lib/backend';

export async function GET(request: NextRequest) {
  return proxyJson(request, '/dashboard/analytics/revenue-by-room-type', { method: 'GET' });
}
