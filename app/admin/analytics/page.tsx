'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
} from 'lucide-react';

export default function AnalyticsPage() {
  const chartData = [
    { month: 'Jan', revenue: 45000, bookings: 120 },
    { month: 'Feb', revenue: 52000, bookings: 135 },
    { month: 'Mar', revenue: 48000, bookings: 128 },
    { month: 'Apr', revenue: 61000, bookings: 155 },
    { month: 'May', revenue: 55000, bookings: 142 },
    { month: 'Jun', revenue: 67000, bookings: 168 },
  ];

  const maxRevenue = Math.max(...chartData.map(d => d.revenue));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white">Analytics & Reports</h1>
        <p className="text-slate-400 mt-2">Track revenue, occupancy, and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Revenue (6 months)</p>
              <p className="text-3xl font-bold text-white mt-2">$328,000</p>
              <p className="text-green-400 text-sm mt-2">+18% vs last period</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <DollarSign size={24} className="text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avg Revenue/Night</p>
              <p className="text-3xl font-bold text-white mt-2">$3,280</p>
              <p className="text-green-400 text-sm mt-2">+8% vs last month</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <TrendingUp size={24} className="text-amber-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Bookings</p>
              <p className="text-3xl font-bold text-white mt-2">848</p>
              <p className="text-blue-400 text-sm mt-2">+22% vs last period</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Calendar size={24} className="text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avg Occupancy</p>
              <p className="text-3xl font-bold text-white mt-2">82.5%</p>
              <p className="text-purple-400 text-sm mt-2">+5% vs last period</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Users size={24} className="text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white">Revenue Trend (6 Months)</h3>
          <p className="text-slate-400 text-sm mt-1">Monthly revenue and booking volume</p>
        </div>

        <div className="space-y-6">
          {/* Chart */}
          <div className="flex items-end justify-between gap-4 h-64">
            {chartData.map((data) => (
              <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                {/* Bar */}
                <div className="w-full flex flex-col items-center">
                  <div className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg hover:from-amber-600 hover:to-amber-500 transition-colors"
                       style={{ height: `${(data.revenue / maxRevenue) * 200}px` }}>
                  </div>
                </div>
                {/* Label */}
                <div className="text-center">
                  <p className="text-slate-300 font-semibold">${(data.revenue / 1000).toFixed(0)}k</p>
                  <p className="text-slate-500 text-xs mt-1">{data.month}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            {chartData.map((data) => (
              <div key={data.month} className="flex justify-between items-center p-2 bg-slate-800 rounded-lg">
                <div>
                  <p className="text-slate-400 text-xs">{data.month}</p>
                  <p className="text-white font-semibold">${data.revenue.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs">Bookings</p>
                  <p className="text-white font-semibold">{data.bookings}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Performance by Room Type */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white">Performance by Room Type</h3>
        </div>

        <div className="space-y-3">
          {[
            { name: 'Luxury Suite', revenue: 98500, occupancy: 89, bookings: 120 },
            { name: 'Deluxe King', revenue: 75200, occupancy: 85, bookings: 98 },
            { name: 'Standard Double', revenue: 54300, occupancy: 78, bookings: 82 },
          ].map((room) => (
            <div key={room.name} className="p-4 bg-slate-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold">{room.name}</h4>
                <span className="text-amber-400 font-semibold">${room.revenue.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Occupancy Rate</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${room.occupancy}%` }}
                      />
                    </div>
                    <span className="text-white font-semibold">{room.occupancy}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400">Bookings</p>
                  <p className="text-white font-semibold mt-1">{room.bookings}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
