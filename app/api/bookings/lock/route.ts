import { NextRequest } from 'next/server';
import { proxyJson } from '@/lib/backend';

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyJson(request, '/bookings/lock', {
    method: 'POST',
    body,
    headers: { 'Content-Type': request.headers.get('content-type') || 'application/json' },
  });
}

