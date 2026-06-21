import { headers } from 'next/headers';

export interface TenantContext {
  slug: string | null;
  businessId: string | null;
  customDomain: string | null;
}

const PLATFORM_ROUTES = new Set([
  'admin',
  'super-admin',
  'api',
  'auth',
  'offline',
  'payment',
  '_next',
]);

export function extractTenantFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;
  const first = segments[0];
  if (PLATFORM_ROUTES.has(first)) return null;
  return first;
}

export async function getTenantFromHeaders(): Promise<TenantContext> {
  const h = await headers();
  const host = h.get('host') ?? '';
  const tenantSlug = h.get('x-tenant-slug');

  if (tenantSlug) {
    return { slug: tenantSlug, businessId: null, customDomain: null };
  }

  const subdomain = host.split('.')[0];
  if (subdomain && subdomain !== 'localhost' && subdomain !== 'www' && !host.includes('localhost')) {
    return { slug: subdomain, businessId: null, customDomain: host };
  }

  return { slug: null, businessId: null, customDomain: null };
}

export function buildTenantPath(slug: string, path = '') {
  return `/${slug}${path.startsWith('/') ? path : `/${path}`}`;
}
