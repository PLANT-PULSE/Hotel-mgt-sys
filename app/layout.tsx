import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { AiChatbot } from '@/components/ai-chatbot';
import './globals.css';

const _geist = Geist({ subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'LuxeStay Hotel',
    template: '%s | LuxeStay Hotel',
  },
  description: 'Premium hotel booking and management — browse rooms, book stays, and manage reservations.',
  applicationName: 'LuxeStay Hotel',
  generator: 'LuxeStay',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LuxeStay',
  },
  formatDetection: {
    telephone: true,
    email: true,
  },
  icons: {
    icon: [
      { url: '/icon', sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f59e0b' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <AiChatbot />
        <PwaProvider />
        <Analytics />
      </body>
    </html>
  );
}
