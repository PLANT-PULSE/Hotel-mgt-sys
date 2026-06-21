import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractTenantFromPath } from '@/lib/tenant';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tenantSlug = extractTenantFromPath(pathname);

  const response = NextResponse.next();

  if (tenantSlug) {
    response.headers.set('x-tenant-slug', tenantSlug);
  }

  const host = request.headers.get('host') ?? '';
  const subdomain = host.split('.')[0];
  if (
    subdomain &&
    subdomain !== 'localhost' &&
    subdomain !== 'www' &&
    !host.startsWith('localhost')
  ) {
    response.headers.set('x-tenant-slug', subdomain);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
