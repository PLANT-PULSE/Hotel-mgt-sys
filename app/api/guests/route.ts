import { NextRequest } from 'next/server';
import { proxyJson } from '@/lib/backend';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '20';

  return proxyJson(
    request,
    `/guests?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`,
    { method: 'GET' },
  );
}
