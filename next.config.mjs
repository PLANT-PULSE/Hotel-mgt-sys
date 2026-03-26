/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['192.168.1.193', '192.168.1.194', '10.41.88.75'],
  async rewrites() {
    // Use environment variable for API URL (defaults to localhost for dev)
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/:path(.+)',
        destination: `${apiBaseUrl}/api/v1/:path`,
      },
    ];
  },
}

export default nextConfig;
