'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Users, MapPin, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
  images: string[];
  available?: boolean;
}

interface BookingDates {
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDates, setBookingDates] = useState<BookingDates>({
    checkIn: null,
    checkOut: null,
    guests: 1,
  });
  const [selectedImageIndexes, setSelectedImageIndexes] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(false);
      // Mock data for now
      setRooms([
        {
          id: '1',
          name: 'Luxury Suite',
          type: 'suite',
          basePrice: 450,
          size: '65m²',
          maxGuests: 4,
          beds: 2,
          amenities: ['Wi-Fi', 'Mini Bar', 'Jacuzzi', 'City View', 'Premium Toiletries'],
          description: 'Experience ultimate luxury in our signature suite with premium amenities and stunning city views.',
          images: [],
          available: true,
        },
        {
          id: '2',
          name: 'Deluxe King',
          type: 'double',
          basePrice: 350,
          size: '45m²',
          maxGuests: 2,
          beds: 1,
          amenities: ['Wi-Fi', 'Safe', 'Flat-screen TV', 'Work Desk'],
          description: 'Spacious double room perfect for business or leisure travelers.',
          images: [],
          available: true,
        },
        {
          id: '3',
          name: 'Standard Twin',
          type: 'twin',
          basePrice: 280,
          size: '35m²',
          maxGuests: 2,
          beds: 2,
          amenities: ['Wi-Fi', 'Air Conditioning', 'Shower'],
          description: 'Comfortable twin room ideal for friends or colleagues.',
          images: [],
          available: true,
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  const handlePreviousImage = (roomId: string) => {
    setSelectedImageIndexes(prev => ({
      ...prev,
      [roomId]: (prev[roomId] || 0) === 0 ? 0 : (prev[roomId] || 0) - 1,
    }));
  };

  const handleNextImage = (roomId: string) => {
    setSelectedImageIndexes(prev => ({
      ...prev,
      [roomId]: (prev[roomId] || 0) + 1,
    }));
  };

  const nights = bookingDates.checkIn && bookingDates.checkOut
    ? Math.ceil((bookingDates.checkOut.getTime() - bookingDates.checkIn.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-serif text-gray-900 mb-2">Our Rooms</h1>
              <p className="text-gray-600">Discover our collection of luxury accommodations</p>
            </div>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← Back to Home
            </Link>
          </div>

          {/* Search & Filter Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Check Availability</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  onChange={(e) => setBookingDates(prev => ({
                    ...prev,
                    checkIn: e.target.value ? new Date(e.target.value) : null,
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  onChange={(e) => setBookingDates(prev => ({
                    ...prev,
                    checkOut: e.target.value ? new Date(e.target.value) : null,
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
                <select
                  value={bookingDates.guests}
                  onChange={(e) => setBookingDates(prev => ({
                    ...prev,
                    guests: parseInt(e.target.value),
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Rooms Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">Loading rooms...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map(room => {
              const currentImageIndex = selectedImageIndexes[room.id] || 0;
              const totalImages = room.images?.length || 0;
              
              return (
                <Card key={room.id} className="bg-white border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Image Gallery */}
                  <div className="relative h-64 bg-gray-100 group">
                    {room.images && room.images.length > 0 ? (
                      <>
                        <img
                          src={room.images[currentImageIndex]}
                          alt={room.name}
                          className="w-full h-full object-cover"
                        />
                        {totalImages > 1 && (
                          <>
                            <button
                              onClick={() => handlePreviousImage(room.id)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button
                              onClick={() => handleNextImage(room.id)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ChevronRight size={20} />
                            </button>
                            <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                              {currentImageIndex + 1}/{totalImages}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <MapPin size={48} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Title & Price */}
                    <div className="mb-4">
                      <h3 className="text-xl font-serif text-gray-900 mb-2">{room.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-serif text-amber-600">${room.basePrice}</span>
                        <span className="text-gray-600">per night</span>
                      </div>
                    </div>

                    {/* Description */}
                    {room.description && (
                      <p className="text-gray-600 text-sm mb-4">{room.description}</p>
                    )}

                    {/* Room Details */}
                    <div className="grid grid-cols-3 gap-3 mb-4 py-4 border-y border-gray-200">
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-gray-900">{room.size}</p>
                        <p className="text-xs text-gray-600">Size</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-gray-900">{room.beds}</p>
                        <p className="text-xs text-gray-600">Bed{room.beds > 1 ? 's' : ''}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-gray-900">{room.maxGuests}</p>
                        <p className="text-xs text-gray-600">Guest{room.maxGuests > 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {/* Amenities */}
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Amenities</p>
                        <div className="flex flex-wrap gap-2">
                          {room.amenities.slice(0, 4).map((amenity, idx) => (
                            <span key={idx} className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs">
                              <Check size={14} />
                              {amenity}
                            </span>
                          ))}
                          {room.amenities.length > 4 && (
                            <span className="text-xs text-gray-500">+{room.amenities.length - 4} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Booking Info & CTA */}
                    {bookingDates.checkIn && bookingDates.checkOut && nights > 0 && (
                      <div className="bg-amber-50 p-3 rounded-lg mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">{nights} night{nights > 1 ? 's' : ''}</span>
                          <span className="font-semibold text-gray-900">${room.basePrice * nights}</span>
                        </div>
                        <p className="text-xs text-gray-500">All taxes and fees included</p>
                      </div>
                    )}

                    {/* Button */}
                    <Link href={`/rooms/${room.id}`}>
                      <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                        View Details & Book
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
