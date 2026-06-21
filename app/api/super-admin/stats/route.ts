import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-api';

export async function GET() {
  try {
    const res = await backendFetch('/businesses/platform/stats', {}, true);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data.data ?? data);
  } catch {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 });
  }
}
