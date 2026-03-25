import { NextRequest, NextResponse } from 'next/server';

function normalizeBaseUrl(url: string) {
  const trimmed = url.replace(/\/+$/, '');
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
}

export function backendBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  return normalizeBaseUrl(raw);
}

type ProxyInit = Omit<RequestInit, 'headers'> & { headers?: Record<string, string> };

async function tryRefresh(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken')?.value;
  if (!refreshToken) return null;

  const res = await fetch(`${backendBaseUrl()}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });

  if (!res.ok) return null;
  const tokens = (await res.json()) as { accessToken: string; refreshToken: string; expiresIn: number };
  return tokens;
}

export async function backendFetchWithAuth(
  request: NextRequest,
  backendPath: string,
  init?: ProxyInit,
) {
  const accessToken = request.cookies.get('accessToken')?.value;

  const doFetch = (token?: string) =>
    fetch(`${backendBaseUrl()}${backendPath}`, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        'Content-Type': init?.headers?.['Content-Type'] || 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });

  let res = await doFetch(accessToken);
  if (res.status !== 401) return { res, setCookies: null as null | { accessToken: string; refreshToken: string } };

  const refreshed = await tryRefresh(request);
  if (!refreshed) return { res, setCookies: null as null | { accessToken: string; refreshToken: string } };

  res = await doFetch(refreshed.accessToken);
  return {
    res,
    setCookies: { accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken },
  };
}

export async function proxyJson(
  request: NextRequest,
  backendPath: string,
  init?: ProxyInit,
) {
  const { res, setCookies } = await backendFetchWithAuth(request, backendPath, init);
  const bodyText = await res.text();

  const out = new NextResponse(bodyText, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'application/json',
    },
  });

  if (setCookies) {
    out.cookies.set('accessToken', setCookies.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
    out.cookies.set('refreshToken', setCookies.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
  }

  return out;
}

