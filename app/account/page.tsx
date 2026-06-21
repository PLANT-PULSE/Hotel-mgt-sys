'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Calendar, Heart, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
  const [bookings, setBookings] = useState<unknown[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const stored = localStorage.getItem('user');
    if (!token || !stored) {
      router.push('/auth/login');
      return;
    }
    setUser(JSON.parse(stored));

    fetch(`${API_BASE}/bookings/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setBookings(d.data ?? d ?? []))
      .catch(() => {});
  }, [router]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Account</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" onClick={() => { localStorage.clear(); router.push('/auth/login'); }}>
          Logout
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: User, label: 'Profile', href: '/account' },
          { icon: Calendar, label: 'Bookings', href: '/account#bookings' },
          { icon: Heart, label: 'Favorites', href: '/account/favorites' },
          { icon: FileText, label: 'Invoices', href: '/account/invoices' },
        ].map(({ icon: Icon, label, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="flex items-center gap-3 pt-6">
                <Icon className="h-5 w-5 text-primary" />
                <span className="font-medium">{label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card id="bookings">
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-muted-foreground">No bookings yet. <Link href="/" className="text-primary">Browse hotels</Link></p>
          ) : (
            <pre className="text-xs overflow-auto">{JSON.stringify(bookings, null, 2)}</pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
