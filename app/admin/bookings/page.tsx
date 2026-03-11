'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface Booking {
  id: string;
  bookingNumber: string;
  guestName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  totalAmount: number;
  nights: number;
}

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Mock bookings data
  const bookings: Booking[] = [
    {
      id: '1',
      bookingNumber: 'LXS-2024-00123',
      guestName: 'John Smith',
      roomType: 'Luxury Suite',
      checkInDate: '2024-03-15',
      checkOutDate: '2024-03-18',
      status: 'CONFIRMED',
      totalAmount: 1350,
      nights: 3,
    },
    {
      id: '2',
      bookingNumber: 'LXS-2024-00124',
      guestName: 'Emma Johnson',
      roomType: 'Deluxe King',
      checkInDate: '2024-03-16',
      checkOutDate: '2024-03-19',
      status: 'PENDING',
      totalAmount: 1050,
      nights: 3,
    },
    {
      id: '3',
      bookingNumber: 'LXS-2024-00125',
      guestName: 'Michael Chen',
      roomType: 'Luxury Suite',
      checkInDate: '2024-03-17',
      checkOutDate: '2024-03-20',
      status: 'CHECKED_IN',
      totalAmount: 1350,
      nights: 3,
    },
  ];

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'CHECKED_IN':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'CHECKED_OUT':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default:
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'CHECKED_IN':
      case 'CHECKED_OUT':
        return <CheckCircle size={16} />;
      case 'PENDING':
        return <Clock size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white">Bookings</h1>
        <p className="text-slate-400 mt-2">Manage all bookings and reservations</p>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900 border-slate-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Search size={20} className="text-slate-400" />
            <Input
              placeholder="Search by booking number or guest name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="CHECKED_OUT">Checked Out</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">{filteredBookings.length} bookings</span>
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800 bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-300">Booking</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-300">Guest</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-300">Room</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-300">Dates</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-300">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-300">Amount</th>
                <th className="px-6 py-4 text-center font-semibold text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{booking.bookingNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-slate-500" />
                      <span className="text-white">{booking.guestName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-300">{booking.roomType}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar size={16} />
                      <span>{booking.nights} nights</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 font-semibold text-amber-400">
                      <DollarSign size={16} />
                      {booking.totalAmount}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-amber-400 hover:bg-amber-500/10"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
