'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BedDouble, Users, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface RoomType {
  id: string;
  name: string;
  type: string;
  basePrice: number;
  size: string;
  maxGuests: number;
  beds: number;
  amenities: string[];
  description?: string;
  images: { url: string; isPrimary: boolean }[];
  roomsLeft: number;
}

export default function RoomsPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingRoom, setBookingRoom] = useState<RoomType | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [availabilityMsg, setAvailabilityMsg] = useState('');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    if (!bookingRoom || !checkIn || !checkOut) {
      setAvailabilityMsg('');
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          roomTypeId: bookingRoom.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
        });
        const res = await fetch(`/api/bookings/availability?${params}`);
        const data = await res.json();

        if (data.availableQuantity > 0) {
          setAvailabilityMsg(`${data.availableQuantity} room(s) available for these dates`);
        } else {
          setAvailabilityMsg('No rooms available for these dates');
        }
      } catch {
        setAvailabilityMsg('Could not check availability');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [bookingRoom, checkIn, checkOut]);

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch('/api/rooms/types');
      const data = await response.json();
      setRoomTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch room types:', error);
      setRoomTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryImage = (images: RoomType['images']) => {
    const primary = images.find((img) => img.isPrimary);
    return primary?.url || images[0]?.url || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';
  };

  const resetBookingForm = () => {
    setCheckIn('');
    setCheckOut('');
    setGuestFirstName('');
    setGuestLastName('');
    setGuestEmail('');
    setGuestPhone('');
    setSpecialRequests('');
    setAvailabilityMsg('');
    setSessionToken(null);
    setBookingSuccess(null);
    setBookingError(null);
  };

  const openBooking = (room: RoomType) => {
    resetBookingForm();
    setBookingRoom(room);
  };

  const closeBooking = async () => {
    if (sessionToken) {
      await fetch(`/api/bookings/reservation-lock/${sessionToken}`, { method: 'DELETE' });
    }
    setBookingRoom(null);
    resetBookingForm();
  };

  const handleBook = async () => {
    if (!bookingRoom) return;

    if (!checkIn || !checkOut || !guestFirstName || !guestLastName || !guestEmail) {
      setBookingError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      let lockToken = sessionToken;

      if (!lockToken) {
        const lockRes = await fetch('/api/bookings/reservation-lock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomTypeId: bookingRoom.id,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            quantity: 1,
          }),
        });

        if (!lockRes.ok) {
          const err = await lockRes.json();
          throw new Error(err.message || 'Rooms are no longer available for these dates');
        }

        const lockData = await lockRes.json();
        lockToken = lockData.sessionToken;
        setSessionToken(lockToken);
      }

      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guestFirstName,
          guestLastName,
          guestEmail,
          guestPhone: guestPhone || undefined,
          specialRequests: specialRequests || undefined,
          sessionToken: lockToken,
          items: [
            {
              roomTypeId: bookingRoom.id,
              quantity: 1,
              pricePerNight: bookingRoom.basePrice,
            },
          ],
        }),
      });

      const bookingData = await bookingRes.json();

      if (!bookingRes.ok) {
        throw new Error(bookingData.message || bookingData.error || 'Booking failed');
      }

      setBookingSuccess(bookingData.bookingNumber);
      await fetchRoomTypes();
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Booking failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <Navbar />
      <div className="container mx-auto px-4 mt-14 sm:mt-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Our Rooms</h1>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our comfortable and luxurious rooms designed to make your stay memorable.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {roomTypes.map((room) => (
            <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-56 overflow-hidden">
                <img
                  src={getPrimaryImage(room.images)}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                {room.roomsLeft > 0 ? (
                  <Badge className="absolute top-4 right-4 bg-green-500">
                    {room.roomsLeft} rooms left
                  </Badge>
                ) : (
                  <Badge className="absolute top-4 right-4 bg-red-500">
                    Sold Out
                  </Badge>
                )}
              </div>

              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold">{room.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">4.8</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {room.size} • {room.beds} Bed{room.beds > 1 ? 's' : ''} • Up to {room.maxGuests} Guests
                </p>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  {room.description || 'A comfortable stay awaits you.'}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {room.amenities.slice(0, 4).map((amenity, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {room.amenities.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{room.amenities.length - 4} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <BedDouble className="h-4 w-4" />
                    <span>{room.beds} Bed{room.beds > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{room.maxGuests} Guests</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t pt-4">
                <div>
                  <span className="text-2xl font-bold text-blue-600">${room.basePrice}</span>
                  <span className="text-gray-500">/night</span>
                </div>
                <Button disabled={room.roomsLeft === 0} onClick={() => openBooking(room)}>
                  {room.roomsLeft > 0 ? 'Book Now' : 'Sold Out'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {roomTypes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No rooms available at the moment.</p>
          </div>
        )}
      </div>

      <Dialog open={!!bookingRoom} onOpenChange={(open) => !open && closeBooking()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book {bookingRoom?.name}</DialogTitle>
          </DialogHeader>

          {bookingSuccess ? (
            <div className="space-y-4 py-4">
              <p className="text-green-600 font-medium">Booking confirmed!</p>
              <p className="text-sm text-gray-600">
                Your booking number is <strong>{bookingSuccess}</strong>. We have sent a confirmation to your email.
              </p>
              <Button className="w-full" onClick={() => closeBooking()}>Close</Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check-in *</Label>
                  <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Check-out *</Label>
                  <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                </div>
              </div>

              {availabilityMsg && (
                <p className={`text-sm ${availabilityMsg.includes('No rooms') ? 'text-red-600' : 'text-green-600'}`}>
                  {availabilityMsg}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input value={guestFirstName} onChange={(e) => setGuestFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input value={guestLastName} onChange={(e) => setGuestLastName(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Special Requests</Label>
                <Textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                />
              </div>

              {bookingError && <p className="text-sm text-red-600">{bookingError}</p>}

              <Button className="w-full" onClick={handleBook} disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : `Confirm Booking — $${bookingRoom?.basePrice}/night`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
