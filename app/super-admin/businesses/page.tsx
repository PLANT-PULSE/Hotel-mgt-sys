'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Business {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  city?: string;
  owner?: { firstName: string; lastName: string; email: string };
  _count?: { bookings: number; members: number };
}

export default function SuperAdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/super-admin/businesses');
    const data = await res.json();
    setBusinesses(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAction(id: string, action: 'suspend' | 'restore') {
    await fetch('/api/super-admin/businesses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, reason: 'Admin action' }),
    });
    load();
  }

  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-green-500/20 text-green-400',
    SUSPENDED: 'bg-red-500/20 text-red-400',
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    DELETED: 'bg-slate-500/20 text-slate-400',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Businesses</h1>
        <p className="text-slate-400">Manage all tenant businesses on the platform</p>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Slug</TableHead>
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Owner</TableHead>
                <TableHead className="text-slate-400">Bookings</TableHead>
                <TableHead className="text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businesses.map((b) => (
                <TableRow key={b.id} className="border-slate-800">
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="text-slate-400">{b.slug}</TableCell>
                  <TableCell>{b.type}</TableCell>
                  <TableCell>
                    <Badge className={statusColor[b.status] ?? ''}>{b.status}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {b.owner ? `${b.owner.firstName} ${b.owner.lastName}` : '—'}
                  </TableCell>
                  <TableCell>{b._count?.bookings ?? 0}</TableCell>
                  <TableCell className="space-x-2">
                    {b.status === 'ACTIVE' && (
                      <Button size="sm" variant="destructive" onClick={() => handleAction(b.id, 'suspend')}>
                        Suspend
                      </Button>
                    )}
                    {b.status === 'SUSPENDED' && (
                      <Button size="sm" variant="outline" onClick={() => handleAction(b.id, 'restore')}>
                        Restore
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
