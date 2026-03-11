'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  BarChart3, 
  Users, 
  Hotel, 
  DollarSign,
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  activeGuests: number;
  checkInsToday: number;
  checkOutsToday: number;
  pendingPayments: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    activeGuests: 0,
    checkInsToday: 0,
    checkOutsToday: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch dashboard stats from API
    // For now, using mock data
    setStats({
      totalBookings: 156,
      totalRevenue: 24580,
      occupancyRate: 78,
      activeGuests: 34,
      checkInsToday: 8,
      checkOutsToday: 5,
      pendingPayments: 3,
    });
    setLoading(false);
  }, []);

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    change, 
    color 
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    change?: number;
    color: string;
  }) => (
    <Card className="bg-slate-900 border-slate-800 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {Icon}
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white">Welcome back!</h1>
        <p className="text-slate-400 mt-2">Here's what's happening with your hotel today.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Hotel size={24} className="text-blue-400" />}
          label="Active Bookings"
          value={stats.totalBookings}
          change={12}
          color="bg-blue-500/10"
        />
        <StatCard
          icon={<DollarSign size={24} className="text-green-400" />}
          label="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change={8}
          color="bg-green-500/10"
        />
        <StatCard
          icon={<Users size={24} className="text-purple-400" />}
          label="Active Guests"
          value={stats.activeGuests}
          change={5}
          color="bg-purple-500/10"
        />
        <StatCard
          icon={<BarChart3 size={24} className="text-amber-400" />}
          label="Occupancy Rate"
          value={`${stats.occupancyRate}%`}
          change={3}
          color="bg-amber-500/10"
        />
      </div>

      {/* Daily Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar size={20} className="text-amber-400" />
            <h3 className="text-lg font-semibold">Today's Operations</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <div>
                <p className="text-slate-400 text-sm">Check-ins Today</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.checkInsToday}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">→</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <div>
                <p className="text-slate-400 text-sm">Check-outs Today</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.checkOutsToday}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">←</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle size={20} className="text-orange-400" />
            <h3 className="text-lg font-semibold">Pending Actions</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div>
                <p className="text-orange-200 text-sm">Pending Payments</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.pendingPayments}</p>
              </div>
              <div className="text-orange-400">
                <DollarSign size={24} />
              </div>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg">
              <p className="text-slate-400 text-sm">Room Maintenance</p>
              <p className="text-2xl font-bold text-white mt-1">2</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recent Bookings</h3>
          <button className="text-amber-400 hover:text-amber-300 text-sm font-medium">
            View All →
          </button>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
              <div>
                <p className="text-white font-medium">Booking #{1001 + item}</p>
                <p className="text-slate-400 text-sm">Guest Check-in: Mar {15 + item}</p>
              </div>
              <div className="text-right">
                <p className="text-amber-400 font-semibold">$450.00</p>
                <p className="text-slate-400 text-sm">2 nights</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
