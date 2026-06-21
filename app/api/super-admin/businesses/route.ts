import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-api';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? '';
  const page = searchParams.get('page') ?? '1';
  const limit = searchParams.get('limit') ?? '20';

  try {
    const res = await backendFetch(
      `/businesses?status=${status}&page=${page}&limit=${limit}`,
      {},
      true,
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 });
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, action, reason } = body;

  const path =
    action === 'suspend'
      ? `/businesses/${id}/suspend`
      : action === 'restore'
        ? `/businesses/${id}/restore`
        : null;

  if (!path) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const res = await backendFetch(path, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  }, true);

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const res = await backendFetch(`/businesses/${id}`, { method: 'DELETE' }, true);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
