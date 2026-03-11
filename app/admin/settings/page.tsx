'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Lock, Users, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'team', label: 'Team', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-2">Manage your hotel system configuration</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800">
        <div className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-colors ${
                  isActive
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Hotel Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Hotel Name</Label>
                  <Input
                    defaultValue="LuxeStay Hotel"
                    className="mt-2 bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Hotel Email</Label>
                  <Input
                    type="email"
                    defaultValue="info@luxestay.com"
                    className="mt-2 bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Phone Number</Label>
                  <Input
                    defaultValue="+1 (555) 123-4567"
                    className="mt-2 bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Address</Label>
                  <Input
                    defaultValue="123 Luxury Street, City, State"
                    className="mt-2 bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-300">Currency</Label>
                <select className="mt-2 w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2">
                  <option>USD - US Dollar</option>
                  <option>EUR - Euro</option>
                  <option>GBP - British Pound</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Booking Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">Minimum Stay</p>
                  <p className="text-slate-400 text-sm">Minimum nights required for booking</p>
                </div>
                <Input
                  type="number"
                  defaultValue="1"
                  min="1"
                  className="w-20 bg-slate-700 border-slate-600 text-white text-right"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">Cancellation Window</p>
                  <p className="text-slate-400 text-sm">Hours before check-in to allow cancellation</p>
                </div>
                <Input
                  type="number"
                  defaultValue="48"
                  min="0"
                  className="w-20 bg-slate-700 border-slate-600 text-white text-right"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">Check-in Time</Label>
                  <p className="text-slate-400 text-sm">Default check-in time</p>
                </div>
                <Input
                  type="time"
                  defaultValue="15:00"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">Check-out Time</p>
                  <p className="text-slate-400 text-sm">Default check-out time</p>
                </div>
                <Input
                  type="time"
                  defaultValue="11:00"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          </Card>

          <Button onClick={handleSave} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}

      {/* Notifications Settings */}
      {activeTab === 'notifications' && (
        <Card className="bg-slate-900 border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            {[
              { label: 'New Bookings', description: 'Notify on new bookings' },
              { label: 'Payment Received', description: 'Notify when payments are received' },
              { label: 'Guest Check-in', description: 'Notify on guest check-ins' },
              { label: 'Room Maintenance', description: 'Notify about maintenance issues' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">{item.label}</p>
                  <p className="text-slate-400 text-sm">{item.description}</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5" />
              </div>
            ))}
          </div>
          <Button onClick={handleSave} disabled={loading} className="mt-6 bg-amber-500 hover:bg-amber-600 text-black font-semibold">
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </Card>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <Card className="bg-slate-900 border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Current Password</Label>
              <Input
                type="password"
                placeholder="Enter current password"
                className="mt-2 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                className="mt-2 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Confirm Password</Label>
              <Input
                type="password"
                placeholder="Confirm new password"
                className="mt-2 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Button onClick={handleSave} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </Card>
      )}

      {/* Team Settings */}
      {activeTab === 'team' && (
        <Card className="bg-slate-900 border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Team Members</h3>
          <div className="space-y-3">
            {[
              { name: 'Admin User', email: 'admin@luxestay.com', role: 'Administrator' },
              { name: 'Manager User', email: 'manager@luxestay.com', role: 'Manager' },
              { name: 'Receptionist', email: 'receptionist@luxestay.com', role: 'Receptionist' },
            ].map((member) => (
              <div key={member.email} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">{member.name}</p>
                  <p className="text-slate-400 text-sm">{member.email}</p>
                </div>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded text-sm font-medium">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
          <Button className="mt-6 bg-amber-500 hover:bg-amber-600 text-black font-semibold">
            + Add Team Member
          </Button>
        </Card>
      )}
    </div>
  );
}
