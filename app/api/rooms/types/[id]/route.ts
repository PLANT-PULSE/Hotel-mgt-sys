import { NextRequest } from 'next/server';
import { proxyJson } from '@/lib/backend';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyJson(request, `/rooms/${id}`, { method: 'GET' });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.text();
  return proxyJson(request, `/rooms/${id}`, {
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
  return proxyJson(request, `/rooms/${id}`, { method: 'DELETE' });
}
