'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Download,
  Plus
} from 'lucide-react';

interface Booking {
  id: string;
  bookingNumber: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone?: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: string;
  specialRequests?: string;
  items: { roomType: { name: string }; quantity: number }[];
  createdAt: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, meta.page]);

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams();
      params.set('page', meta.page.toString());
      params.set('limit', meta.limit.toString());
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/bookings?${params}`);
      const data = await response.json();
      
      setBookings(data.data || []);
      setMeta(data.meta || { page: 1, limit: 20, total: 0 });
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      // Mock data
      setBookings([
        {
          id: '1',
          bookingNumber: 'LXS-2026-00123',
          guestFirstName: 'John',
          guestLastName: 'Smith',
          guestEmail: 'john.smith@email.com',
          guestPhone: '+1234567890',
          checkInDate: '2026-03-15',
          checkOutDate: '2026-03-18',
          totalAmount: 450,
          status: 'CONFIRMED',
          specialRequests: 'Early check-in preferred',
          items: [{ roomType: { name: 'Deluxe Suite' }, quantity: 1 }],
          createdAt: '2026-03-01',
        },
        {
          id: '2',
          bookingNumber: 'LXS-2026-00122',
          guestFirstName: 'Sarah',
          guestLastName: 'Johnson',
          guestEmail: 'sarah.j@email.com',
          checkInDate: '2026-03-10',
          checkOutDate: '2026-03-12',
          totalAmount: 280,
          status: 'CHECKED_IN',
          items: [{ roomType: { name: 'Standard Room' }, quantity: 1 }],
          createdAt: '2026-03-02',
        },
        {
          id: '3',
          bookingNumber: 'LXS-2026-00121',
          guestFirstName: 'Michael',
          guestLastName: 'Brown',
          guestEmail: 'm.brown@email.com',
          checkInDate: '2026-03-20',
          checkOutDate: '2026-03-25',
          totalAmount: 750,
          status: 'PENDING',
          items: [{ roomType: { name: 'Executive Suite' }, quantity: 1 }],
          createdAt: '2026-03-03',
        },
        {
          id: '4',
          bookingNumber: 'LXS-2026-00120',
          guestFirstName: 'Emily',
          guestLastName: 'Davis',
          guestEmail: 'emily.d@email.com',
          checkInDate: '2026-03-08',
          checkOutDate: '2026-03-10',
          totalAmount: 320,
          status: 'CHECKED_OUT',
          items: [{ roomType: { name: 'Premium Room' }, quantity: 1 }],
          createdAt: '2026-03-04',
        },
        {
          id: '5',
          bookingNumber: 'LXS-2026-00119',
          guestFirstName: 'David',
          guestLastName: 'Wilson',
          guestEmail: 'd.wilson@email.com',
          checkInDate: '2026-03-22',
          checkOutDate: '2026-03-24',
          totalAmount: 180,
          status: 'CANCELLED',
          items: [{ roomType: { name: 'Standard Room' }, quantity: 1 }],
          createdAt: '2026-03-05',
        },
      ]);
      setMeta({ page: 1, limit: 20, total: 5 });
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchBookings();
    } catch (error) {
      console.error('Failed to update booking status:', error);
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
      PENDING: 'bg-yellow-500 hover:bg-yellow-600',
      CONFIRMED: 'bg-green-500 hover:bg-green-600',
      CHECKED_IN: 'bg-blue-500 hover:bg-blue-600',
      CHECKED_OUT: 'bg-gray-500 hover:bg-gray-600',
      CANCELLED: 'bg-red-500 hover:bg-red-600',
      NO_SHOW: 'bg-orange-500 hover:bg-orange-600',
    };
    return colors[status] || 'bg-gray-500';
  };

  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.bookingNumber.toLowerCase().includes(searchLower) ||
      booking.guestFirstName.toLowerCase().includes(searchLower) ||
      booking.guestLastName.toLowerCase().includes(searchLower) ||
      booking.guestEmail.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(meta.total / meta.limit);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500">Manage all reservations and bookings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or booking number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  {statusFilter || 'All Status'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('')}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('PENDING')}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('CONFIRMED')}>
                  Confirmed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('CHECKED_IN')}>
                  Checked In
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('CHECKED_OUT')}>
                  Checked Out
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('CANCELLED')}>
                  Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Room Type</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No bookings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.bookingNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {booking.guestFirstName} {booking.guestLastName}
                        </p>
                        <p className="text-sm text-gray-500">{booking.guestEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.items.map((item, i) => (
                        <span key={i}>
                          {item.quantity}x {item.roomType.name}
                        </span>
                      ))}
                    </TableCell>
                    <TableCell>{formatDate(booking.checkInDate)}</TableCell>
                    <TableCell>{formatDate(booking.checkOutDate)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(booking.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {booking.status === 'PENDING' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Confirm
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                                className="text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel
                              </DropdownMenuItem>
                            </>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <DropdownMenuItem 
                              onClick={() => updateBookingStatus(booking.id, 'CHECKED_IN')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Check In
                            </DropdownMenuItem>
                          )}
                          {booking.status === 'CHECKED_IN' && (
                            <DropdownMenuItem 
                              onClick={() => updateBookingStatus(booking.id, 'CHECKED_OUT')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Check Out
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Calendar className="mr-2 h-4 w-4" />
                            Modify Dates
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} bookings
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMeta({ ...meta, page: meta.page - 1 })}
              disabled={meta.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMeta({ ...meta, page: meta.page + 1 })}
              disabled={meta.page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
