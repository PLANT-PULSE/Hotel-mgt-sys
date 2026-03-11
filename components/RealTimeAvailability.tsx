'use client';

import React, { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface RealTimeAvailabilityProps {
  roomTypeId: string;
  roomName: string;
  checkInDate?: string;
  checkOutDate?: string;
}

export function RealTimeAvailability({
  roomTypeId,
  roomName,
  checkInDate,
  checkOutDate,
}: RealTimeAvailabilityProps) {
  const { isConnected, availability, getAvailability, subscribe } = useWebSocket();
  const [showNotification, setShowNotification] = useState(false);

  // Subscribe to room channel on mount
  useEffect(() => {
    const channel = `room:${roomTypeId}`;
    subscribe(channel);
  }, [roomTypeId, subscribe]);

  // Get availability when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate && isConnected) {
      getAvailability(roomTypeId, checkInDate, checkOutDate);
    }
  }, [roomTypeId, checkInDate, checkOutDate, isConnected, getAvailability]);

  const roomAvailability = availability.get(roomTypeId);

  if (!roomAvailability) {
    return null;
  }

  const { available, total } = roomAvailability;
  const isAvailable = available > 0;
  const percentageAvailable = Math.round((available / total) * 100);

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isAvailable ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <div>
            <p className="font-semibold text-gray-900">{roomName}</p>
            <p className="text-sm text-gray-600">
              {available} of {total} rooms available
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isAvailable ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${percentageAvailable}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 min-w-12">
            {percentageAvailable}%
          </span>
        </div>
      </div>

      {/* Connection indicator */}
      <div className="mt-3 flex items-center gap-2 text-xs">
        <Activity
          className={`w-3 h-3 ${isConnected ? 'text-green-500' : 'text-gray-400'}`}
        />
        <span className={isConnected ? 'text-green-600' : 'text-gray-500'}>
          {isConnected ? 'Live updates enabled' : 'Offline'}
        </span>
      </div>
    </Card>
  );
}
