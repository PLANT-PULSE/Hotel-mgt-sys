'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Upload, 
  Image as ImageIcon,
  Search,
  X,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

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
  image?: string;
  images: string[];
  totalUnits: number;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/rooms', {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        setRooms(data.data || data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch rooms',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      // Mock data for testing
      setRooms([
        {
          id: '1',
          name: 'Luxury Suite',
          type: 'suite',
          basePrice: 450,
          size: '65m²',
          maxGuests: 4,
          beds: 2,
          amenities: ['Wi-Fi', 'Mini Bar', 'Jacuzzi', 'View'],
          description: 'Spacious luxury suite with premium amenities',
          images: [],
          totalUnits: 3,
        },
        {
          id: '2',
          name: 'Deluxe King',
          type: 'double',
          basePrice: 350,
          size: '45m²',
          maxGuests: 2,
          beds: 1,
          amenities: ['Wi-Fi', 'Safe', 'TV'],
          description: 'Comfortable room with king-size bed',
          images: [],
          totalUnits: 5,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = useCallback(async (roomTypeId: string, files: FileList) => {
    if (!files || files.length === 0) return;

    setUploadingImages(prev => ({ ...prev, [roomTypeId]: true }));

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`/api/v1/rooms/images/${roomTypeId}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: `${files.length} image(s) uploaded successfully`,
        });
        
        // Update room with new images
        setRooms(prevRooms =>
          prevRooms.map(room =>
            room.id === roomTypeId
              ? { ...room, images: data.imageUrls }
              : room
          )
        );

        if (selectedRoom?.id === roomTypeId) {
          setSelectedRoom({
            ...selectedRoom,
            images: data.imageUrls,
          });
        }
      } else {
        toast({
          title: 'Error',
          description: 'Failed to upload images',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload images',
        variant: 'destructive',
      });
    } finally {
      setUploadingImages(prev => ({ ...prev, [roomTypeId]: false }));
    }
  }, [selectedRoom, toast]);

  const handleRemoveImage = async (roomTypeId: string, imageUrl: string) => {
    try {
      const response = await fetch(`/api/v1/rooms/images/${roomTypeId}/remove-image`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Image removed successfully',
        });

        setRooms(prevRooms =>
          prevRooms.map(room =>
            room.id === roomTypeId
              ? { ...room, images: room.images.filter(img => img !== imageUrl) }
              : room
          )
        );

        if (selectedRoom?.id === roomTypeId) {
          setSelectedRoom({
            ...selectedRoom,
            images: selectedRoom.images.filter(img => img !== imageUrl),
          });
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove image',
        variant: 'destructive',
      });
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12">Loading rooms...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Room Management</h1>
          <p className="text-slate-400 mt-2">Manage room types, pricing, and images</p>
        </div>
        <Link href="/admin/rooms/new">
          <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
            <Plus size={20} className="mr-2" />
            Add Room Type
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="bg-slate-900 border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <Search size={20} className="text-slate-400" />
          <Input
            placeholder="Search rooms by name or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      </Card>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map(room => (
          <Card key={room.id} className="bg-slate-900 border-slate-800 overflow-hidden hover:border-slate-700 transition-colors">
            {/* Image Gallery */}
            <div className="relative h-48 bg-slate-800 overflow-hidden">
              {room.images && room.images.length > 0 ? (
                <img
                  src={room.images[0]}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center flex-col gap-2 text-slate-500">
                  <ImageIcon size={32} />
                  <p className="text-sm">No images yet</p>
                </div>
              )}
              
              {/* Image Count Badge */}
              {room.images && room.images.length > 0 && (
                <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                  {room.images.length} photos
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">{room.name}</h3>
                <p className="text-amber-400 font-semibold mt-1">${room.basePrice}/night</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-800 p-2 rounded">
                  <p className="text-slate-400">Type</p>
                  <p className="text-white font-medium">{room.type}</p>
                </div>
                <div className="bg-slate-800 p-2 rounded">
                  <p className="text-slate-400">Size</p>
                  <p className="text-white font-medium">{room.size}</p>
                </div>
                <div className="bg-slate-800 p-2 rounded">
                  <p className="text-slate-400">Beds</p>
                  <p className="text-white font-medium">{room.beds}</p>
                </div>
                <div className="bg-slate-800 p-2 rounded">
                  <p className="text-slate-400">Guests</p>
                  <p className="text-white font-medium">{room.maxGuests}</p>
                </div>
              </div>

              {/* Amenities */}
              {room.amenities && room.amenities.length > 0 && (
                <div className="text-sm">
                  <p className="text-slate-400 mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-300">
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-300">
                        +{room.amenities.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setSelectedRoom(room);
                    setShowEditModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg transition-colors text-sm font-medium">
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-900 border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900">
              <h2 className="text-2xl font-bold text-white">Edit {selectedRoom.name}</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Image Upload Section */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Room Images</Label>
                
                {/* Upload Area */}
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-amber-500 transition-colors cursor-pointer"
                     onClick={() => document.getElementById(`file-input-${selectedRoom.id}`)?.click()}>
                  <input
                    id={`file-input-${selectedRoom.id}`}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleImageUpload(selectedRoom.id, e.target.files);
                      }
                    }}
                    disabled={uploadingImages[selectedRoom.id]}
                  />
                  <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-slate-400">
                    {uploadingImages[selectedRoom.id] 
                      ? 'Uploading...' 
                      : 'Click to upload images or drag and drop'}
                  </p>
                  <p className="text-slate-500 text-sm mt-1">PNG, JPG, WebP up to 5MB</p>
                </div>

                {/* Image Gallery */}
                {selectedRoom.images && selectedRoom.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-slate-400 mb-3">Uploaded Images ({selectedRoom.images.length})</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedRoom.images.map((imageUrl, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Room ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleRemoveImage(selectedRoom.id, imageUrl)}
                            className="absolute top-1 right-1 bg-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Room Details */}
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Name</Label>
                  <Input
                    defaultValue={selectedRoom.name}
                    className="mt-2 bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Price per Night</Label>
                    <Input
                      type="number"
                      defaultValue={selectedRoom.basePrice}
                      className="mt-2 bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Type</Label>
                    <Input
                      defaultValue={selectedRoom.type}
                      className="mt-2 bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">Description</Label>
                  <textarea
                    defaultValue={selectedRoom.description}
                    className="mt-2 w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 text-sm"
                    rows={3}
                  />
                </div>
              </div>

              {/* Save Button */}
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-2">
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
