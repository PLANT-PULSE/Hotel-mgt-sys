'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Check,
  AlertCircle,
  Lock,
} from 'lucide-react';

interface BookingFormData {
  checkInDate: string;
  checkOutDate: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests: string;
}

export default function RoomDetailPage({ params }: { params: { id: string } }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<'dates' | 'info' | 'payment'>('dates');
  const [formData, setFormData] = useState<BookingFormData>({
    checkInDate: '',
    checkOutDate: '',
    guestFirstName: '',
    guestLastName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: '',
  });
  const [bookingProcessing, setBookingProcessing] = useState(false);

  // Mock room data
  const room = {
    id: params.id,
    name: 'Luxury Suite',
    type: 'suite',
    basePrice: 450,
    size: '65m²',
    maxGuests: 4,
    beds: 2,
    amenities: ['Wi-Fi', 'Mini Bar', 'Jacuzzi', 'City View', 'Premium Toiletries', 'Work Desk', 'Air Conditioning', 'Safe'],
    description: 'Experience ultimate luxury in our signature suite with premium amenities and stunning city views.',
    fullDescription: `Our luxurious suite offers the perfect blend of comfort and elegance. 
    
Features an expansive bedroom with king-size bed, a separate living area with sofa, and a marble bathroom with rainfall shower and soaking tub. 
    
Floor-to-ceiling windows provide panoramic city views and natural light throughout the day. Premium bedding and furnishings ensure the utmost comfort for a restful night's sleep.

Perfect for special occasions, extended stays, or guests seeking the finest accommodations.`,
    images: [],
  };

  const nights = formData.checkInDate && formData.checkOutDate
    ? Math.ceil(
        (new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) /
        (1000 * 60 * 60 * 24)
      )
    : 0;

  const totalPrice = room.basePrice * nights * quantity;

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitBooking = async () => {
    setBookingProcessing(true);
    try {
      // API call will be made in Phase 5
      console.log('Booking data:', {
        ...formData,
        roomTypeId: room.id,
        quantity,
        basePrice: room.basePrice,
        totalPrice,
        nights,
      });
      
      // Show success message
      setStep('payment');
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setBookingProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/rooms" className="text-gray-600 hover:text-gray-900 mb-4 inline-block">
            ← Back to Rooms
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Room Details & Images */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <Card className="mb-8 overflow-hidden">
              <div className="relative h-96 bg-gray-100 group">
                {room.images && room.images.length > 0 ? (
                  <>
                    <img
                      src={room.images[currentImageIndex]}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <MapPin size={64} />
                  </div>
                )}

                {/* Image Controls */}
                <button
                  onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </Card>

            {/* Room Info */}
            <Card className="p-8 mb-8">
              <h1 className="text-4xl font-serif text-gray-900 mb-4">{room.name}</h1>
              
              <div className="grid grid-cols-4 gap-4 mb-8 py-8 border-y border-gray-200">
                <div>
                  <p className="text-3xl font-semibold text-gray-900">{room.size}</p>
                  <p className="text-sm text-gray-600">Size</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-gray-900">{room.beds}</p>
                  <p className="text-sm text-gray-600">Beds</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-gray-900">{room.maxGuests}</p>
                  <p className="text-sm text-gray-600">Max Guests</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-amber-600">${room.basePrice}</p>
                  <p className="text-sm text-gray-600">per night</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-serif text-gray-900 mb-4">About This Room</h2>
                <p className="text-gray-700 whitespace-pre-line">{room.fullDescription}</p>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="text-2xl font-serif text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {room.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Check size={20} className="text-green-600" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Booking Form */}
          <div>
            <Card className="p-6 sticky top-8">
              <h2 className="text-2xl font-serif text-gray-900 mb-6">Book Your Stay</h2>

              {step === 'dates' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-700">Check-in Date</Label>
                    <input
                      type="date"
                      value={formData.checkInDate}
                      onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                      className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700">Check-out Date</Label>
                    <input
                      type="date"
                      value={formData.checkOutDate}
                      onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                      className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700">Number of Rooms</Label>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    >
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  {nights > 0 && (
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-700">${room.basePrice} × {nights} nights × {quantity} room{quantity > 1 ? 's' : ''}</span>
                        <span className="font-semibold text-gray-900">${totalPrice}</span>
                      </div>
                      <p className="text-sm text-gray-600">All taxes and fees included</p>
                    </div>
                  )}

                  <Button
                    onClick={() => setStep('info')}
                    disabled={!formData.checkInDate || !formData.checkOutDate}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3"
                  >
                    Continue to Guest Info
                  </Button>
                </div>
              )}

              {step === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-gray-700">First Name</Label>
                      <Input
                        value={formData.guestFirstName}
                        onChange={(e) => handleInputChange('guestFirstName', e.target.value)}
                        className="mt-2"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700">Last Name</Label>
                      <Input
                        value={formData.guestLastName}
                        onChange={(e) => handleInputChange('guestLastName', e.target.value)}
                        className="mt-2"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-700">Email</Label>
                    <Input
                      type="email"
                      value={formData.guestEmail}
                      onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                      className="mt-2"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700">Phone Number</Label>
                    <Input
                      type="tel"
                      value={formData.guestPhone}
                      onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                      className="mt-2"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700">Special Requests</Label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                      className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      rows={3}
                      placeholder="Any special requests or preferences..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep('dates')}
                      variant="outline"
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmitBooking}
                      disabled={
                        !formData.guestFirstName ||
                        !formData.guestLastName ||
                        !formData.guestEmail ||
                        bookingProcessing
                      }
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3"
                    >
                      {bookingProcessing ? 'Processing...' : 'Complete Booking'}
                    </Button>
                  </div>
                </div>
              )}

              {step === 'payment' && (
                <div className="text-center py-8">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <Check size={48} className="text-green-600 mx-auto mb-3" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Your booking has been secured. A confirmation email has been sent to {formData.guestEmail}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Booking Reference: <span className="font-mono font-semibold">LXS-2024-{Math.random().toString(36).substr(2, 5).toUpperCase()}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 bg-blue-50 p-3 rounded-lg">
                    <Lock size={16} />
                    <span>Payment will be processed securely</span>
                  </div>

                  <Link href="/">
                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                      Return to Home
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
