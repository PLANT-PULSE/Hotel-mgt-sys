'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BedDouble, Users, DollarSign, Star } from 'lucide-react';

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

  useEffect(() => {
    fetchRoomTypes();
  }, []);

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
    const primary = images.find(img => img.isPrimary);
    return primary?.url || images[0]?.url || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Rooms</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our comfortable and luxurious rooms designed to make your stay memorable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roomTypes.map((room) => (
            <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {/* Room Image Carousel */}
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
                <p className="text-sm text-gray-500">{room.size} • {room.beds} Bed{room.beds > 1 ? 's' : ''} • Up to {room.maxGuests} Guests</p>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{room.description}</p>
                
                {/* Amenities */}
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

                {/* Room Info */}
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
                <Button disabled={room.roomsLeft === 0}>
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
    </div>
  );
}
