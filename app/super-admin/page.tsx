'use client';

import { useEffect, useState } from 'react';
import { Building2, Users, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PlatformStats {
  totalBusinesses: number;
  activeBusinesses: number;
  suspendedBusinesses: number;
  totalBookings: number;
  totalCustomers: number;
  totalSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

function StatCard({
  title,
  value,
  icon: Icon,
  format = 'number',
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  format?: 'number' | 'currency';
}) {
  const display =
    format === 'currency'
      ? new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(value)
      : value.toLocaleString();

  return (
    <Card className="border-slate-800 bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        <Icon className="h-4 w-4 text-amber-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-100">{display}</div>
      </CardContent>
    </Card>
  );
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/super-admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-slate-400">Loading platform stats...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Platform Overview</h1>
        <p className="text-slate-400">Multi-tenant SaaS booking platform metrics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Businesses" value={stats?.totalBusinesses ?? 0} icon={Building2} />
        <StatCard title="Active Businesses" value={stats?.activeBusinesses ?? 0} icon={TrendingUp} />
        <StatCard title="Suspended" value={stats?.suspendedBusinesses ?? 0} icon={AlertCircle} />
        <StatCard title="Total Bookings" value={stats?.totalBookings ?? 0} icon={Calendar} />
        <StatCard title="Total Customers" value={stats?.totalCustomers ?? 0} icon={Users} />
        <StatCard title="Active Subscriptions" value={stats?.totalSubscriptions ?? 0} icon={Building2} />
        <StatCard title="Total Revenue" value={stats?.totalRevenue ?? 0} icon={DollarSign} format="currency" />
        <StatCard title="Monthly Revenue" value={stats?.monthlyRevenue ?? 0} icon={DollarSign} format="currency" />
      </div>
    </div>
  );
}
