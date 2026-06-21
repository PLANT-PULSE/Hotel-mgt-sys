import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'LuxeStay Hotel',
    short_name: 'LuxeStay',
    description: 'Premium hotel booking and management — browse rooms, book stays, and manage reservations.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#0f172a',
    theme_color: '#f59e0b',
    categories: ['travel', 'business', 'lifestyle'],
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'Browse Rooms',
        short_name: 'Rooms',
        url: '/rooms',
        icons: [{ src: '/icon', sizes: '512x512', type: 'image/png' }],
      },
      {
        name: 'Admin Dashboard',
        short_name: 'Admin',
        url: '/admin/dashboard',
        icons: [{ src: '/icon', sizes: '512x512', type: 'image/png' }],
      },
    ],
  };
}
