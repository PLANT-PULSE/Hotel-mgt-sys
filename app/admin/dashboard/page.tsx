'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CalendarDays, 
  Users, 
  DollarSign, 
  BedDouble, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';

interface DashboardStats {
  monthlyRevenue: number;
  totalRevenue: number;
  totalBookings: number;
  occupancyRate: number;
  totalCustomers: number;
  totalRooms: number;
  roomStatus: {
    available: number;
    occupied: number;
    cleaning: number;
    maintenance: number;
  };
}

interface RevenueData {
  month: string;
  revenue: number;
}

interface RecentBooking {
  id: string;
  bookingNumber: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: string;
  items: { roomType: { name: string } }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, revenueRes, bookingsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/revenue?months=6'),
        fetch('/api/dashboard/recent-bookings?limit=5'),
      ]);

      const statsData = await statsRes.json();
      const revenueData = await revenueRes.json();
      const bookingsData = await bookingsRes.json();

      setStats(statsData);
      setRevenue(revenueData);
      setRecentBookings(bookingsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-500',
      CONFIRMED: 'bg-green-500',
      CHECKED_IN: 'bg-blue-500',
      CHECKED_OUT: 'bg-gray-500',
      CANCELLED: 'bg-red-500',
      NO_SHOW: 'bg-orange-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const maxRevenue = Math.max(...revenue.map(r => r.revenue), 1);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here's your hotel overview.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <CalendarDays className="mr-2 h-4 w-4" />
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.monthlyRevenue || 0)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+12.5%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold">{stats?.totalBookings || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-blue-500 font-medium">Active bookings</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Occupancy Rate</p>
                <p className="text-2xl font-bold">{stats?.occupancyRate || 0}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <BedDouble className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">
                {stats?.roomStatus?.occupied || 0} of {stats?.totalRooms || 0} rooms occupied
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Guests</p>
                <p className="text-2xl font-bold">{stats?.totalCustomers || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Activity className="h-4 w-4 text-orange-500 mr-1" />
              <span className="text-orange-500 font-medium">Registered guests</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Status Overview */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Room Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-green-600">Available</p>
                <p className="text-2xl font-bold text-green-700">{stats?.roomStatus?.available || 0}</p>
              </div>
              <BedDouble className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-blue-600">Occupied</p>
                <p className="text-2xl font-bold text-blue-700">{stats?.roomStatus?.occupied || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm text-yellow-600">Cleaning</p>
                <p className="text-2xl font-bold text-yellow-700">{stats?.roomStatus?.cleaning || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm text-red-600">Maintenance</p>
                <p className="text-2xl font-bold text-red-700">{stats?.roomStatus?.maintenance || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {revenue.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                    style={{ 
                      height: `${(item.revenue / maxRevenue) * 200}px`,
                      minHeight: '4px'
                    }}
                    title={formatCurrency(item.revenue)}
                  ></div>
                  <span className="text-xs text-gray-500">{item.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {booking.guestFirstName[0]}{booking.guestLastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{booking.guestFirstName} {booking.guestLastName}</p>
                      <p className="text-sm text-gray-500">
                        {booking.items[0]?.roomType?.name || 'Room'} • {booking.bookingNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(booking.totalAmount)}</p>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {recentBookings.length === 0 && (
                <p className="text-center text-gray-500 py-4">No recent bookings</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
