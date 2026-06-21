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
import { BedDouble, Users, Star, CreditCard, Smartphone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { resolveRoomImageUrl } from '@/lib/room-images';

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
  const [bookingStep, setBookingStep] = useState<'details' | 'payment' | 'success'>('details');
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'MOBILE'>('CARD');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [momoPhone, setMomoPhone] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

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
    return resolveRoomImageUrl(primary?.url || images[0]?.url);
  };

  const getNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const getEstimatedTotal = () => {
    if (!bookingRoom) return 0;
    return bookingRoom.basePrice * getNights();
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
    setBookingStep('details');
    setPendingBookingId(null);
    setPendingTotal(0);
    setPaymentMethod('CARD');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setMomoPhone('');
    setPaymentError(null);
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

      setPendingBookingId(bookingData.id);
      setPendingTotal(Number(bookingData.totalAmount) || getEstimatedTotal());
      setBookingSuccess(bookingData.bookingNumber || null);
      setBookingStep('payment');
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Booking failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!pendingBookingId) return;

    if (paymentMethod === 'CARD') {
      const digits = cardNumber.replace(/\D/g, '');
      if (digits.length < 13 || !cardExpiry || cardCvv.length < 3) {
        setPaymentError('Please enter valid card details');
        return;
      }
    } else if (!momoPhone.trim()) {
      setPaymentError('Please enter your mobile money number');
      return;
    }

    setIsSubmitting(true);
    setPaymentError(null);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: pendingBookingId,
          amount: pendingTotal,
          method: paymentMethod,
          cardLast4: paymentMethod === 'CARD' ? cardNumber.replace(/\D/g, '').slice(-4) : undefined,
          phoneNumber: paymentMethod === 'MOBILE' ? momoPhone : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Payment failed');
      }

      setBookingStep('success');
      await fetchRoomTypes();
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Payment failed');
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {bookingStep === 'payment'
                ? 'Complete Payment'
                : bookingStep === 'success'
                  ? 'Booking Confirmed'
                  : `Book ${bookingRoom?.name}`}
            </DialogTitle>
          </DialogHeader>

          {bookingStep === 'success' ? (
            <div className="space-y-4 py-4">
              <p className="text-green-600 font-medium">Payment successful — your stay is confirmed!</p>
              <p className="text-sm text-gray-600">
                Your booking number is <strong>{bookingSuccess}</strong>. We have sent a confirmation to your email.
              </p>
              <Button className="w-full" onClick={() => closeBooking()}>Close</Button>
            </div>
          ) : bookingStep === 'payment' ? (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-gray-50 p-4 text-sm">
                <p className="font-medium text-gray-900">{bookingRoom?.name}</p>
                <p className="text-gray-600">
                  {checkIn} → {checkOut} ({getNights()} night{getNights() !== 1 ? 's' : ''})
                </p>
                <p className="text-lg font-bold text-blue-600 mt-2">
                  Total: ${pendingTotal.toFixed(2)}
                </p>
              </div>

              <div className="space-y-3">
                <Label>Payment Method</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as 'CARD' | 'MOBILE')}
                  className="grid gap-3"
                >
                  <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="CARD" />
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Credit / Debit Card</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="MOBILE" />
                    <Smartphone className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Mobile Money (MoMo)</span>
                  </label>
                </RadioGroup>
              </div>

              {paymentMethod === 'CARD' ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Card Number</Label>
                    <Input
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expiry</Label>
                      <Input
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CVV</Label>
                      <Input
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Mobile Money Number *</Label>
                  <Input
                    placeholder="+233 XX XXX XXXX"
                    value={momoPhone}
                    onChange={(e) => setMomoPhone(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    You will receive a prompt on your phone to approve the payment.
                  </p>
                </div>
              )}

              {paymentError && <p className="text-sm text-red-600">{paymentError}</p>}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setBookingStep('details')}>
                  Back
                </Button>
                <Button className="flex-1" onClick={handlePayment} disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : `Pay $${pendingTotal.toFixed(2)}`}
                </Button>
              </div>
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

              {getNights() > 0 && (
                <p className="text-sm text-gray-600">
                  Estimated total: <strong>${getEstimatedTotal().toFixed(2)}</strong> ({getNights()} night{getNights() !== 1 ? 's' : ''})
                </p>
              )}

              <Button className="w-full" onClick={handleBook} disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Continue to Payment'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
