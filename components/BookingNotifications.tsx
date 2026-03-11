'use client';

import React, { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  type: 'booking-created' | 'booking-confirmed' | 'booking-cancelled';
  bookingNumber: string;
  roomTypeId: string;
  guestEmail: string;
  timestamp: string;
}

export function BookingNotifications() {
  const { bookingNotifications } = useWebSocket();
  const [displayedNotifications, setDisplayedNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (bookingNotifications.length > 0) {
      const notification: Notification = {
        id: `${bookingNotifications[0].bookingNumber}-${Date.now()}`,
        type: bookingNotifications[0].type,
        bookingNumber: bookingNotifications[0].bookingNumber,
        roomTypeId: bookingNotifications[0].roomTypeId,
        guestEmail: bookingNotifications[0].guestEmail,
        timestamp: bookingNotifications[0].timestamp,
      };

      setDisplayedNotifications((prev) => [notification, ...prev.slice(0, 4)]);

      // Auto-remove notification after 5 seconds
      const timer = setTimeout(() => {
        setDisplayedNotifications((prev) =>
          prev.filter((n) => n.id !== notification.id)
        );
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [bookingNotifications]);

  const removeNotification = (id: string) => {
    setDisplayedNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {displayedNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationItem({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) {
  let icon: React.ReactNode;
  let bgColor: string;
  let textColor: string;
  let title: string;
  let message: string;

  switch (notification.type) {
    case 'booking-confirmed':
      icon = <CheckCircle className="w-5 h-5 text-green-500" />;
      bgColor = 'bg-green-50 border-green-200';
      textColor = 'text-green-900';
      title = 'Booking Confirmed';
      message = `Booking ${notification.bookingNumber} confirmed for ${notification.guestEmail}`;
      break;

    case 'booking-cancelled':
      icon = <XCircle className="w-5 h-5 text-red-500" />;
      bgColor = 'bg-red-50 border-red-200';
      textColor = 'text-red-900';
      title = 'Booking Cancelled';
      message = `Booking ${notification.bookingNumber} has been cancelled`;
      break;

    case 'booking-created':
    default:
      icon = <AlertCircle className="w-5 h-5 text-blue-500" />;
      bgColor = 'bg-blue-50 border-blue-200';
      textColor = 'text-blue-900';
      title = 'Booking Created';
      message = `New booking ${notification.bookingNumber} created`;
      break;
  }

  return (
    <div className={`${bgColor} border rounded-lg p-4 max-w-sm shadow-lg`}>
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1">
          <h4 className={`font-semibold ${textColor}`}>{title}</h4>
          <p className={`text-sm ${textColor} opacity-75`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`${textColor} hover:opacity-70 transition-opacity`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
