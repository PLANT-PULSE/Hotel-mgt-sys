'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  Bell,
  Lock,
  Save,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface Settings {
  hotelName: string;
  hotelEmail: string;
  hotelPhone: string;
  hotelAddress: string;
  city: string;
  country: string;
  zipCode: string;
  website: string;
  description: string;
  currency: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  lowStockAlert: boolean;
  bookingConfirmation: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    hotelName: 'LuxStay Hotel',
    hotelEmail: 'info@luxstay.com',
    hotelPhone: '+1 (800) 123-4567',
    hotelAddress: '123 Luxury Lane',
    city: 'New York',
    country: 'United States',
    zipCode: '10001',
    website: 'www.luxstay.com',
    description: 'A luxury 5-star hotel offering premium accommodations and world-class service.',
    currency: 'USD',
    timezone: 'UTC-5',
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlert: true,
    bookingConfirmation: true,
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleToggle = (field: keyof Settings) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to backend
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      {saved && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Hotel Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Hotel Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hotelName">Hotel Name</Label>
              <Input
                id="hotelName"
                name="hotelName"
                value={settings.hotelName}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={settings.website}
                onChange={handleChange}
                placeholder="www.example.com"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={settings.description}
              onChange={handleChange}
              placeholder="Hotel description"
              rows={4}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hotelEmail">Email</Label>
              <Input
                id="hotelEmail"
                name="hotelEmail"
                type="email"
                value={settings.hotelEmail}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="hotelPhone">Phone</Label>
              <Input
                id="hotelPhone"
                name="hotelPhone"
                value={settings.hotelPhone}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hotelAddress">Address</Label>
              <Input
                id="hotelAddress"
                name="hotelAddress"
                value={settings.hotelAddress}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={settings.city}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={settings.country}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={settings.zipCode}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary mt-1"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>NGN</option>
                <option>GHS</option>
                <option>ZAR</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary mt-1"
              >
                <option>UTC-8</option>
                <option>UTC-5</option>
                <option>UTC+0</option>
                <option>UTC+1</option>
                <option>UTC+3</option>
                <option>UTC+8</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <Label className="cursor-pointer flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </Label>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle('emailNotifications')}
              />
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <Label className="cursor-pointer flex items-center gap-2">
                <Phone className="h-4 w-4" />
                SMS Notifications
              </Label>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={() => handleToggle('smsNotifications')}
              />
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <Label className="cursor-pointer flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Low Stock Alert
              </Label>
              <Switch
                checked={settings.lowStockAlert}
                onCheckedChange={() => handleToggle('lowStockAlert')}
              />
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <Label className="cursor-pointer flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Booking Confirmation
              </Label>
              <Switch
                checked={settings.bookingConfirmation}
                onCheckedChange={() => handleToggle('bookingConfirmation')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2"
          size="lg"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
