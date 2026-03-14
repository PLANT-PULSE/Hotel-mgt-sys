'use client';

import { useState, useEffect, useRef } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Label 
} from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Wrench,
  BedDouble,
  Users,
  DollarSign,
  Upload
} from 'lucide-react';

interface RoomType {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  maxOccupancy: number;
  bedType: string;
  amenities: string[];
  images: { url: string; isPrimary: boolean; id?: string }[];
}

interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  status: string;
  roomType: RoomType;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState('');
  const [newRoomTypeId, setNewRoomTypeId] = useState('');
  const [newRoomTypeName, setNewRoomTypeName] = useState('');
  const [newRoomTypePrice, setNewRoomTypePrice] = useState('');
  const [newRoomTypeOccupancy, setNewRoomTypeOccupancy] = useState('');
  const [newRoomTypeBed, setNewRoomTypeBed] = useState('');
  const [newRoomTypeImages, setNewRoomTypeImages] = useState<File[]>([]);
  const [newRoomTypeImagePreviews, setNewRoomTypeImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
  }, [statusFilter]);

  const fetchRooms = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/rooms/inventory?${params}`);
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      // Mock data
      setRooms([
        {
          id: '1',
          roomNumber: '101',
          floor: 1,
          status: 'AVAILABLE',
          roomType: { id: '1', name: 'Deluxe Suite', basePrice: 150, maxOccupancy: 2, bedType: 'King', amenities: [], images: [] },
        },
        {
          id: '2',
          roomNumber: '102',
          floor: 1,
          status: 'OCCUPIED',
          roomType: { id: '2', name: 'Standard Room', basePrice: 80, maxOccupancy: 2, bedType: 'Queen', amenities: [], images: [] },
        },
        {
          id: '3',
          roomNumber: '103',
          floor: 1,
          status: 'CLEANING',
          roomType: { id: '1', name: 'Deluxe Suite', basePrice: 150, maxOccupancy: 2, bedType: 'King', amenities: [], images: [] },
        },
        {
          id: '4',
          roomNumber: '201',
          floor: 2,
          status: 'AVAILABLE',
          roomType: { id: '3', name: 'Executive Suite', basePrice: 250, maxOccupancy: 4, bedType: 'King', amenities: [], images: [] },
        },
        {
          id: '5',
          roomNumber: '202',
          floor: 2,
          status: 'MAINTENANCE',
          roomType: { id: '2', name: 'Standard Room', basePrice: 80, maxOccupancy: 2, bedType: 'Queen', amenities: [], images: [] },
        },
        {
          id: '6',
          roomNumber: '301',
          floor: 3,
          status: 'OCCUPIED',
          roomType: { id: '4', name: 'Premium Room', basePrice: 120, maxOccupancy: 2, bedType: 'King', amenities: [], images: [] },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch('/api/rooms/types');
      const data = await response.json();
      setRoomTypes(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Failed to fetch room types:', error);
      setRoomTypes([
        { id: '1', name: 'Deluxe Suite', basePrice: 150, maxOccupancy: 2, bedType: 'King', amenities: [], images: [] },
        { id: '2', name: 'Standard Room', basePrice: 80, maxOccupancy: 2, bedType: 'Queen', amenities: [], images: [] },
        { id: '3', name: 'Executive Suite', basePrice: 250, maxOccupancy: 4, bedType: 'King', amenities: [], images: [] },
        { id: '4', name: 'Premium Room', basePrice: 120, maxOccupancy: 2, bedType: 'King', amenities: [], images: [] },
      ]);
    }
  };

  const updateRoomStatus = async (roomId: string, newStatus: string) => {
    try {
      await fetch(`/api/rooms/inventory/${roomId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchRooms();
    } catch (error) {
      console.error('Failed to update room status:', error);
    }
  };

  const deleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      await fetch(`/api/rooms/inventory/${roomId}`, { method: 'DELETE' });
      fetchRooms();
    } catch (error) {
      console.error('Failed to delete room:', error);
    }
  };

  const uploadImagesToRoom = async (roomTypeId: string, formData: FormData) => {
    try {
      const response = await fetch(`/api/rooms/types/${roomTypeId}/images`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        fetchRooms();
        fetchRoomTypes();
      }
    } catch (error) {
      console.error('Failed to upload images:', error);
    }
  };

  const createRoomType = async () => {
    if (!newRoomTypeName || !newRoomTypePrice || !newRoomTypeOccupancy) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const roomTypeData = {
        name: newRoomTypeName,
        type: 'standard',
        basePrice: parseFloat(newRoomTypePrice),
        maxGuests: parseInt(newRoomTypeOccupancy),
        beds: parseInt(newRoomTypeBed) || 1,
        size: '25m²',
        amenities: [],
      };

      // If there are images, use multipart form data
      if (newRoomTypeImages.length > 0) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(roomTypeData));
        
        for (const file of newRoomTypeImages) {
          formData.append('images', file);
        }

        const response = await fetch('/api/rooms/types', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          resetRoomTypeForm();
          setIsAddTypeOpen(false);
          fetchRoomTypes();
        }
      } else {
        // No images, use JSON
        const response = await fetch('/api/rooms/types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(roomTypeData),
        });

        if (response.ok) {
          resetRoomTypeForm();
          setIsAddTypeOpen(false);
          fetchRoomTypes();
        }
      }
    } catch (error) {
      console.error('Failed to create room type:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetRoomTypeForm = () => {
    setNewRoomTypeName('');
    setNewRoomTypePrice('');
    setNewRoomTypeOccupancy('');
    setNewRoomTypeBed('');
    setNewRoomTypeImages([]);
    setNewRoomTypeImagePreviews([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).slice(0, 3);
      setNewRoomTypeImages(files);
      
      // Create preview URLs
      const previews = files.map(file => URL.createObjectURL(file));
      setNewRoomTypeImagePreviews(previews);
    }
  };

  const createRoom = async () => {
    if (!newRoomNumber || !newRoomFloor || !newRoomTypeId) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/rooms/inventory/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTypeId: newRoomTypeId,
          number: newRoomNumber,
          floor: parseInt(newRoomFloor),
        }),
      });

      if (response.ok) {
        setNewRoomNumber('');
        setNewRoomFloor('');
        setNewRoomTypeId('');
        setIsAddRoomOpen(false);
        fetchRooms();
      }
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      AVAILABLE: 'bg-green-500',
      OCCUPIED: 'bg-blue-500',
      CLEANING: 'bg-yellow-500',
      MAINTENANCE: 'bg-red-500',
      RESERVED: 'bg-purple-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const filteredRooms = rooms.filter(room => {
    const searchLower = searchTerm.toLowerCase();
    return (
      room.roomNumber.toLowerCase().includes(searchLower) ||
      room.roomType.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-500">Manage rooms, room types, and inventory</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddTypeOpen} onOpenChange={(open) => {
            setIsAddTypeOpen(open);
            if (!open) resetRoomTypeForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Room Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Room Type</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Room Type Name *</Label>
                  <Input 
                    placeholder="e.g., Deluxe Suite" 
                    value={newRoomTypeName}
                    onChange={(e) => setNewRoomTypeName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Base Price *</Label>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={newRoomTypePrice}
                      onChange={(e) => setNewRoomTypePrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Occupancy *</Label>
                    <Input 
                      type="number" 
                      placeholder="2" 
                      value={newRoomTypeOccupancy}
                      onChange={(e) => setNewRoomTypeOccupancy(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Number of Beds</Label>
                  <Input 
                    placeholder="e.g., 1" 
                    type="number"
                    value={newRoomTypeBed}
                    onChange={(e) => setNewRoomTypeBed(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Room Images (max 3)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="room-type-images"
                    />
                    <label
                      htmlFor="room-type-images"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Click to upload images</span>
                      <span className="text-xs text-gray-400">PNG, JPG up to 5MB each</span>
                    </label>
                  </div>
                  {newRoomTypeImagePreviews.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {newRoomTypeImagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${idx + 1}`}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = newRoomTypeImages.filter((_, i) => i !== idx);
                              const newPreviews = newRoomTypeImagePreviews.filter((_, i) => i !== idx);
                              setNewRoomTypeImages(newImages);
                              setNewRoomTypeImagePreviews(newPreviews);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button 
                  className="w-full" 
                  onClick={createRoomType}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Room Type'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddRoomOpen} onOpenChange={(open) => {
            setIsAddRoomOpen(open);
            if (!open) {
              setNewRoomNumber('');
              setNewRoomFloor('');
              setNewRoomTypeId('');
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Room Number *</Label>
                  <Input 
                    placeholder="e.g., 101, 201A" 
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Floor *</Label>
                  <Input 
                    type="number" 
                    placeholder="1" 
                    value={newRoomFloor}
                    onChange={(e) => setNewRoomFloor(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Room Type *</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={newRoomTypeId}
                    onChange={(e) => setNewRoomTypeId(e.target.value)}
                  >
                    <option value="">Select a room type</option>
                    {roomTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name} - ${type.basePrice}/night</option>
                    ))}
                  </select>
                </div>
                <Button 
                  className="w-full" 
                  onClick={createRoom}
                  disabled={isSubmitting || roomTypes.length === 0}
                >
                  {isSubmitting ? 'Creating...' : roomTypes.length === 0 ? 'Add Room Type First' : 'Create Room'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Rooms</p>
                <p className="text-2xl font-bold">{rooms.length}</p>
              </div>
              <BedDouble className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {rooms.filter(r => r.status === 'AVAILABLE').length}
                </p>
              </div>
              <BedDouble className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Occupied</p>
                <p className="text-2xl font-bold text-blue-600">
                  {rooms.filter(r => r.status === 'OCCUPIED').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Maintenance</p>
                <p className="text-2xl font-bold text-red-600">
                  {rooms.filter(r => r.status === 'MAINTENANCE').length}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by room number or type..."
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
                <DropdownMenuItem onClick={() => setStatusFilter('AVAILABLE')}>
                  Available
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('OCCUPIED')}>
                  Occupied
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('CLEANING')}>
                  Cleaning
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('MAINTENANCE')}>
                  Maintenance
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Images</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Occupancy</TableHead>
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
              ) : filteredRooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No rooms found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {room.roomType.images && room.roomType.images.length > 0 ? (
                          <div className="flex -space-x-2">
                            {room.roomType.images.slice(0, 3).map((img, idx) => (
                              <img
                                key={idx}
                                src={img.url}
                                alt={`${room.roomType.name} ${idx + 1}`}
                                className="w-10 h-10 rounded-md object-cover border-2 border-white"
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-500">No img</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      Room {room.roomNumber}
                    </TableCell>
                    <TableCell>{room.roomType.name}</TableCell>
                    <TableCell>Floor {room.floor}</TableCell>
                    <TableCell>${room.roomType.basePrice}/night</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        {room.roomType.maxOccupancy}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(room.status)}>
                        {room.status}
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
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Room
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedRoomTypeId(room.roomType.id);
                            fileInputRef.current?.click();
                          }}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Images
                          </DropdownMenuItem>
                          {room.status !== 'MAINTENANCE' && (
                            <DropdownMenuItem 
                              onClick={() => updateRoomStatus(room.id, 'MAINTENANCE')}
                            >
                              <Wrench className="mr-2 h-4 w-4" />
                              Mark Maintenance
                            </DropdownMenuItem>
                          )}
                          {room.status === 'MAINTENANCE' && (
                            <DropdownMenuItem 
                              onClick={() => updateRoomStatus(room.id, 'AVAILABLE')}
                            >
                              <BedDouble className="mr-2 h-4 w-4" />
                              Mark Available
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => deleteRoom(room.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
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
      
      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={async (e) => {
          if (e.target.files && e.target.files.length > 0 && selectedRoomTypeId) {
            const formData = new FormData();
            for (let i = 0; i < Math.min(e.target.files.length, 3); i++) {
              formData.append('images', e.target.files[i]);
            }
            await uploadImagesToRoom(selectedRoomTypeId, formData);
            setSelectedRoomTypeId(null);
            e.target.value = '';
          }
        }}
      />
    </div>
  );
}
