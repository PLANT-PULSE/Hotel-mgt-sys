'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Ban,
  BedDouble,
  CalendarDays
} from 'lucide-react';

interface RoomBooking {
  id: string;
  roomNumber: string;
  roomType: string;
  status: string;
  bookings: {
    id: string;
    bookingNumber: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    status: string;
  }[];
}

interface OccupancyData {
  month: string;
  occupancyRate: number;
  bookedRooms: number;
  totalRooms: number;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rooms, setRooms] = useState<RoomBooking[]>([]);
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBlockDatesOpen, setIsBlockDatesOpen] = useState(false);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 0);

      const [roomsRes, occupancyRes] = await Promise.all([
        fetch(`/api/dashboard/calendar/rooms?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        fetch('/api/dashboard/calendar/occupancy?months=12'),
      ]);

      const roomsData = await roomsRes.json();
      const occupancy = await occupancyRes.json();

      setRooms(roomsData);
      setOccupancyData(occupancy);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
      // Mock data
      setRooms([
        {
          id: '1',
          roomNumber: '101',
          roomType: 'Deluxe Suite',
          status: 'AVAILABLE',
          bookings: [
            { id: '1', bookingNumber: 'LXS-001', guestName: 'John Smith', checkIn: '2026-03-15', checkOut: '2026-03-18', status: 'CONFIRMED' }
          ]
        },
        {
          id: '2',
          roomNumber: '102',
          roomType: 'Standard Room',
          status: 'OCCUPIED',
          bookings: [
            { id: '2', bookingNumber: 'LXS-002', guestName: 'Sarah Johnson', checkIn: '2026-03-10', checkOut: '2026-03-12', status: 'CHECKED_IN' }
          ]
        },
        {
          id: '3',
          roomNumber: '103',
          roomType: 'Deluxe Suite',
          status: 'AVAILABLE',
          bookings: []
        },
        {
          id: '4',
          roomNumber: '201',
          roomType: 'Executive Suite',
          status: 'AVAILABLE',
          bookings: [
            { id: '3', bookingNumber: 'LXS-003', guestName: 'Michael Brown', checkIn: '2026-03-20', checkOut: '2026-03-25', status: 'CONFIRMED' }
          ]
        },
        {
          id: '5',
          roomNumber: '202',
          roomType: 'Standard Room',
          status: 'MAINTENANCE',
          bookings: []
        },
      ]);
      setOccupancyData([
        { month: 'Mar 2026', occupancyRate: 72.5, bookedRooms: 18, totalRooms: 24 },
        { month: 'Apr 2026', occupancyRate: 65.0, bookedRooms: 16, totalRooms: 24 },
        { month: 'May 2026', occupancyRate: 78.3, bookedRooms: 19, totalRooms: 24 },
        { month: 'Jun 2026', occupancyRate: 85.0, bookedRooms: 20, totalRooms: 24 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    // Previous month days
    for (let i = 0; i < startingDay; i++) {
      days.push({ day: null, date: null });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, date: new Date(year, month, i) });
    }
    return days;
  };

  const isDateBooked = (room: RoomBooking, date: Date) => {
    return room.bookings.some(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      return date >= checkIn && date < checkOut;
    });
  };

  const getBookingForDate = (room: RoomBooking, date: Date) => {
    return room.bookings.find(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      return date >= checkIn && date < checkOut;
    });
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const days = getDaysInMonth(currentDate);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Calendar & Occupancy</h1>
          <p className="text-gray-500 text-sm sm:text-base">View room bookings and occupancy rates</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="min-w-[100px] sm:min-w-[150px] text-xs sm:text-sm">
            {monthNames[currentDate.getMonth()].slice(0, 3)} {currentDate.getFullYear()}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Dialog open={isBlockDatesOpen} onOpenChange={setIsBlockDatesOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                <Ban className="mr-1 h-3 sm:h-4 w-3 sm:w-4" />
                <span className="hidden sm:inline">Block Dates</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Block Dates for Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Room</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="">Select a room</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        Room {room.roomNumber} - {room.roomType}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reason (Optional)</Label>
                  <Input placeholder="e.g., Maintenance, Renovation" />
                </div>
                <Button className="w-full">Block Dates</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Occupancy Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {occupancyData.slice(0, 4).map((data, index) => (
          <Card key={index} className="bg-white shadow-sm">
            <CardContent className="pt-4 sm:pt-6">
              <p className="text-xs sm:text-sm text-gray-500">{data.month}</p>
              <div className="mt-1 sm:mt-2 flex items-end justify-between">
                <p className="text-2xl sm:text-3xl font-bold">{data.occupancyRate}%</p>
                <p className="text-xs sm:text-sm text-gray-500">{data.bookedRooms}/{data.totalRooms}</p>
              </div>
              <div className="mt-2 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${data.occupancyRate}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calendar Grid - Desktop only */}
      <Card className="bg-white shadow-sm hidden md:block">
        <CardHeader>
          <CardTitle className="text-lg">Room Bookings Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-8 gap-1 mb-2">
            <div className="text-center text-sm font-medium text-gray-500 p-2"></div>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Room rows */}
          <div className="space-y-1">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              rooms.map(room => (
                <div key={room.id} className="grid grid-cols-8 gap-1">
                  <div className="p-2 flex items-center justify-between text-sm font-medium">
                    <span>Room {room.roomNumber}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {room.roomType}
                    </Badge>
                  </div>
                  {days.map((day, index) => (
                    <div 
                      key={index} 
                      className={`
                        h-12 border rounded text-xs p-1
                        ${!day.day ? 'bg-gray-50' : ''}
                        ${day.date && isDateBooked(room, day.date) ? 'bg-blue-100' : ''}
                        ${room.status === 'MAINTENANCE' ? 'bg-red-50' : ''}
                      `}
                    >
                      {day.day && (
                        <>
                          <span className="text-gray-400">{day.day}</span>
                          {day.date && isDateBooked(room, day.date) && (
                            <div className="mt-1">
                              <div className="h-1.5 bg-blue-500 rounded-full w-full" />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-blue-100 border rounded"></div>
              <span className="text-xs sm:text-sm text-gray-600">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-white border rounded"></div>
              <span className="text-xs sm:text-sm text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-red-50 border rounded"></div>
              <span className="text-xs sm:text-sm text-gray-600">Maintenance</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile-friendly room list view */}
      <Card className="bg-white shadow-sm md:hidden">
        <CardHeader>
          <CardTitle className="text-lg">Room Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rooms.map(room => (
              <div key={room.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Room {room.roomNumber}</span>
                    <Badge variant="outline" className="text-xs">{room.roomType}</Badge>
                  </div>
                  <Badge className={
                    room.status === 'AVAILABLE' ? 'bg-green-500' :
                    room.status === 'OCCUPIED' ? 'bg-blue-500' :
                    room.status === 'MAINTENANCE' ? 'bg-red-500' : 'bg-yellow-500'
                  }>
                    {room.status}
                  </Badge>
                </div>
                {room.bookings.length > 0 ? (
                  <div className="space-y-2">
                    {room.bookings.map(booking => (
                      <div key={booking.id} className="text-xs sm:text-sm bg-blue-50 p-2 rounded">
                        <span className="font-medium">{booking.guestName}</span>
                        <span className="text-gray-500 ml-2">
                          {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500">No bookings</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
