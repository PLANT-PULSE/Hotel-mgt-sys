import { NextRequest } from 'next/server';
import { proxyJson } from '@/lib/backend';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.text();
  return proxyJson(request, `/rooms/inventory/${id}/status`, {
    method: 'PATCH',
    body,
    headers: { 'Content-Type': request.headers.get('content-type') || 'application/json' },
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyJson(request, `/rooms/inventory/${id}`, { method: 'DELETE' });
}
