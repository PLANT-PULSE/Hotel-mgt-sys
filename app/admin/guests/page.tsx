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
  Mail, 
  Phone,
  Calendar,
  DollarSign,
  Star,
  UserPlus
} from 'lucide-react';

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  loyaltyPoints: number;
  totalBookings: number;
  totalSpent: number;
  createdAt: string;
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchGuests();
  }, [page]);

  const fetchGuests = async () => {
    try {
      const response = await fetch(`/api/guests?page=${page}&limit=20`);
      const data = await response.json();
      setGuests(data.data || []);
    } catch (error) {
      console.error('Failed to fetch guests:', error);
      // Mock data
      setGuests([
        {
          id: '1',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@email.com',
          phone: '+1234567890',
          loyaltyPoints: 2500,
          totalBookings: 5,
          totalSpent: 2450,
          createdAt: '2025-06-15',
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.j@email.com',
          phone: '+1234567891',
          loyaltyPoints: 1800,
          totalBookings: 3,
          totalSpent: 1200,
          createdAt: '2025-08-22',
        },
        {
          id: '3',
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'm.brown@email.com',
          phone: '+1234567892',
          loyaltyPoints: 500,
          totalBookings: 1,
          totalSpent: 750,
          createdAt: '2025-11-10',
        },
        {
          id: '4',
          firstName: 'Emily',
          lastName: 'Davis',
          email: 'emily.d@email.com',
          phone: '+1234567893',
          loyaltyPoints: 3200,
          totalBookings: 8,
          totalSpent: 4200,
          createdAt: '2025-01-05',
        },
        {
          id: '5',
          firstName: 'David',
          lastName: 'Wilson',
          email: 'd.wilson@email.com',
          phone: '+1234567894',
          loyaltyPoints: 1200,
          totalBookings: 2,
          totalSpent: 890,
          createdAt: '2025-09-18',
        },
      ]);
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

  const getLoyaltyTier = (points: number) => {
    if (points >= 5000) return { tier: 'Platinum', color: 'bg-purple-500' };
    if (points >= 2000) return { tier: 'Gold', color: 'bg-yellow-500' };
    if (points >= 500) return { tier: 'Silver', color: 'bg-gray-400' };
    return { tier: 'Bronze', color: 'bg-orange-500' };
  };

  const filteredGuests = guests.filter(guest => {
    const searchLower = searchTerm.toLowerCase();
    return (
      guest.firstName.toLowerCase().includes(searchLower) ||
      guest.lastName.toLowerCase().includes(searchLower) ||
      guest.email.toLowerCase().includes(searchLower) ||
      (guest.phone && guest.phone.includes(searchTerm))
    );
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guest Management</h1>
          <p className="text-gray-500">Manage guests and their booking history</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Guest
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Guests</p>
                <p className="text-2xl font-bold">{guests.length}</p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(guests.reduce((sum, g) => sum + g.totalSpent, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold">
                  {guests.reduce((sum, g) => sum + g.totalBookings, 0)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Spent</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    guests.length > 0 
                      ? guests.reduce((sum, g) => sum + g.totalSpent, 0) / guests.length 
                      : 0
                  )}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Guests Table */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Loyalty Points</TableHead>
                <TableHead>Total Bookings</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Member Since</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredGuests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No guests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredGuests.map((guest) => {
                  const { tier, color } = getLoyaltyTier(guest.loyaltyPoints);
                  return (
                    <TableRow key={guest.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {guest.firstName[0]}{guest.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {guest.firstName} {guest.lastName}
                            </p>
                            <Badge className={`${color} text-white`}>
                              {tier}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {guest.email}
                          </div>
                          {guest.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Phone className="h-3 w-3" />
                              {guest.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {guest.loyaltyPoints.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>{guest.totalBookings}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(guest.totalSpent)}
                      </TableCell>
                      <TableCell>{formatDate(guest.createdAt)}</TableCell>
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
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="mr-2 h-4 w-4" />
                              Booking History
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Star className="mr-2 h-4 w-4" />
                              Add Loyalty Points
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {guests.length} guests
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={guests.length < 20}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
