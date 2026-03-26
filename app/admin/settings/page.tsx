'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Building, Mail, Phone, MapPin, Clock, DollarSign, Percent } from 'lucide-react';

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [settings, setSettings] = useState({
    hotelName: 'LuxStay Hotel',
    contactEmail: 'admin@luxstay.com',
    contactPhone: '+1 (555) 123-4567',
    address: '123 Luxury Avenue, Resort District, CA 90210',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in. Cancellations made within 48 hours will incur a one-night fee.',
    currency: 'USD',
    taxRate: '12.5',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    // Simulate API call to save settings
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('Settings updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Hotel Settings</h1>
          <p className="text-gray-500 text-sm sm:text-base">Manage your property's global configuration</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving} className="text-xs sm:text-sm">
            <Save className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {saveMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{saveMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Information */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5 text-gray-400" />
              General Information
            </CardTitle>
            <CardDescription>Update your hotel's primary contact details and address.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hotelName">Hotel Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    id="hotelName" 
                    name="hotelName" 
                    value={settings.hotelName} 
                    onChange={handleChange} 
                    className="pl-10" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    id="contactEmail" 
                    name="contactEmail" 
                    type="email" 
                    value={settings.contactEmail} 
                    onChange={handleChange} 
                    className="pl-10" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    id="contactPhone" 
                    name="contactPhone" 
                    value={settings.contactPhone} 
                    onChange={handleChange} 
                    className="pl-10" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Physical Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    id="address" 
                    name="address" 
                    value={settings.address} 
                    onChange={handleChange} 
                    className="pl-10" 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking & Policies */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              Booking & Policies
            </CardTitle>
            <CardDescription>Configure reservation rules and timing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkInTime">Default Check-in Time</Label>
                <Input 
                  id="checkInTime" 
                  name="checkInTime" 
                  type="time" 
                  value={settings.checkInTime} 
                  onChange={handleChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOutTime">Default Check-out Time</Label>
                <Input 
                  id="checkOutTime" 
                  name="checkOutTime" 
                  type="time" 
                  value={settings.checkOutTime} 
                  onChange={handleChange} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
              <textarea 
                id="cancellationPolicy" 
                name="cancellationPolicy" 
                rows={3}
                value={settings.cancellationPolicy}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Setup */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-400" />
              Financial Settings
            </CardTitle>
            <CardDescription>Manage currency, taxes, and billing formats.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Base Currency</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select 
                    id="currency" 
                    name="currency" 
                    value={settings.currency} 
                    onChange={handleChange}
                    className="w-full pl-10 h-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="CAD">CAD (C$)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">State/Local Tax Rate (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    id="taxRate" 
                    name="taxRate" 
                    type="number" 
                    step="0.01" 
                    value={settings.taxRate} 
                    onChange={handleChange} 
                    className="pl-10" 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
