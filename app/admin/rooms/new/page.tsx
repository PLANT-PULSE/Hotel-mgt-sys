'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface NewRoom {
  name: string;
  type: string;
  basePrice: string;
  size: string;
  maxGuests: string;
  beds: string;
  description: string;
  amenities: string[];
  totalUnits: string;
}

export default function NewRoomPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [formData, setFormData] = useState<NewRoom>({
    name: '',
    type: 'suite',
    basePrice: '',
    size: '',
    maxGuests: '',
    beds: '',
    description: '',
    amenities: [],
    totalUnits: '1',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.basePrice) {
      toast({
        title: 'Error',
        description: 'Please fill in required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Create room type
      const response = await fetch('/api/v1/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          basePrice: parseFloat(formData.basePrice),
          size: formData.size,
          maxGuests: parseInt(formData.maxGuests),
          beds: parseInt(formData.beds),
          description: formData.description,
          amenities: formData.amenities,
          totalUnits: parseInt(formData.totalUnits),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      const room = await response.json();

      // Upload images if provided
      if (images.length > 0) {
        const formDataImages = new FormData();
        images.forEach(file => {
          formDataImages.append('images', file);
        });

        await fetch(`/api/v1/rooms/images/${room.id}/upload`, {
          method: 'POST',
          body: formDataImages,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
      }

      toast({
        title: 'Success',
        description: 'Room type created successfully',
      });

      router.push('/admin/rooms');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create room',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/rooms" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-4">
          <ArrowLeft size={20} />
          Back to Rooms
        </Link>
        <h1 className="text-4xl font-bold text-white">Create New Room Type</h1>
        <p className="text-slate-400 mt-2">Add a new room type with pricing, amenities, and images</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="bg-slate-900 border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-slate-300">Room Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Luxury Suite"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-2 bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="type" className="text-slate-300">Room Type *</Label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="mt-2 w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
              >
                <option value="suite">Suite</option>
                <option value="double">Double</option>
                <option value="single">Single</option>
                <option value="penthouse">Penthouse</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="basePrice" className="text-slate-300">Price per Night (USD) *</Label>
              <Input
                id="basePrice"
                name="basePrice"
                type="number"
                step="0.01"
                placeholder="e.g., 450"
                value={formData.basePrice}
                onChange={handleInputChange}
                className="mt-2 bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="totalUnits" className="text-slate-300">Total Units</Label>
              <Input
                id="totalUnits"
                name="totalUnits"
                type="number"
                min="1"
                value={formData.totalUnits}
                onChange={handleInputChange}
                className="mt-2 bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <Label htmlFor="size" className="text-slate-300">Size (m²)</Label>
              <Input
                id="size"
                name="size"
                placeholder="e.g., 65"
                value={formData.size}
                onChange={handleInputChange}
                className="mt-2 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="maxGuests" className="text-slate-300">Max Guests</Label>
              <Input
                id="maxGuests"
                name="maxGuests"
                type="number"
                placeholder="e.g., 4"
                value={formData.maxGuests}
                onChange={handleInputChange}
                className="mt-2 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="beds" className="text-slate-300">Number of Beds</Label>
              <Input
                id="beds"
                name="beds"
                type="number"
                placeholder="e.g., 2"
                value={formData.beds}
                onChange={handleInputChange}
                className="mt-2 bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="description" className="text-slate-300">Description</Label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe the room features and amenities..."
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="mt-2 w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3"
            />
          </div>
        </Card>

        {/* Amenities */}
        <Card className="bg-slate-900 border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Amenities</h2>
          
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Add amenity (e.g., Wi-Fi, Jacuzzi)"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddAmenity()}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Button
              type="button"
              onClick={handleAddAmenity}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              Add
            </Button>
          </div>

          {formData.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="bg-amber-500/20 border border-amber-500/30 text-amber-200 px-3 py-1 rounded-full flex items-center gap-2"
                >
                  <span>{amenity}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(idx)}
                    className="hover:text-amber-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Images */}
        <Card className="bg-slate-900 border-slate-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Room Images</h2>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-amber-500 transition-colors cursor-pointer mb-4"
               onClick={() => document.getElementById('image-input')?.click()}>
            <input
              id="image-input"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <Upload size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-slate-400">Click to upload images or drag and drop</p>
            <p className="text-slate-500 text-sm mt-1">PNG, JPG, WebP up to 5MB each</p>
          </div>

          {/* Image Preview */}
          {images.length > 0 && (
            <div>
              <p className="text-slate-400 mb-3">Selected Images ({images.length})</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold py-2"
          >
            {loading ? 'Creating...' : 'Create Room Type'}
          </Button>
          <Link href="/admin/rooms" className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
