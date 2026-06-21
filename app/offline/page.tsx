import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <WifiOff className="h-16 w-16 text-amber-400 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-3">You&apos;re offline</h1>
        <p className="text-slate-300 mb-8">
          LuxeStay needs an internet connection for bookings and live room availability.
          Cached pages may still be available.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-amber-500 hover:bg-amber-600">
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
            <Link href="/rooms">Browse Rooms</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
