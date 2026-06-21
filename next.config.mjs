import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['192.168.1.193', '192.168.1.194', '192.168.1.124'],
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        { key: 'Service-Worker-Allowed', value: '/' },
      ],
    },
  ],
  async rewrites() {
    const backendOrigin =
      (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1').replace(
        /\/api\/v1\/?$/,
        '',
      );
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendOrigin}/uploads/:path*`,
      },
    ];
  },
}

export default nextConfig
