'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface ClientMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping' | 'get-availability';
  channel?: string;
  roomTypeId?: string;
  checkInDate?: string;
  checkOutDate?: string;
}

interface AvailabilityUpdate {
  type: 'availability-update';
  roomTypeId: string;
  availableUnits: number;
  totalUnits: number;
  timestamp: string;
}

interface BookingNotification {
  type: 'booking-created' | 'booking-confirmed' | 'booking-cancelled';
  bookingNumber: string;
  roomTypeId: string;
  guestEmail: string;
  timestamp: string;
}

type WebSocketMessage = AvailabilityUpdate | BookingNotification | { type: 'pong'; timestamp: string };

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [availability, setAvailability] = useState<Map<string, { available: number; total: number }>>(new Map());
  const [bookingNotifications, setBookingNotifications] = useState<BookingNotification[]>([]);

  useEffect(() => {
    // Determine WebSocket protocol based on current protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'availability-update':
            setAvailability((prev) => {
              const newMap = new Map(prev);
              newMap.set(message.roomTypeId, {
                available: message.availableUnits,
                total: message.totalUnits,
              });
              return newMap;
            });
            break;

          case 'booking-created':
          case 'booking-confirmed':
          case 'booking-cancelled':
            setBookingNotifications((prev) => [message, ...prev]);
            // Keep only last 10 notifications
            if (prev.length > 10) {
              return prev.slice(0, 10);
            }
            break;

          default:
            // Handle other message types like pong
            break;
        }
      } catch (error) {
        console.error('[WebSocket] Message parsing error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);
    };

    wsRef.current = ws;

    // Cleanup
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  const subscribe = useCallback((channel: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'subscribe',
          channel,
        } as ClientMessage)
      );
    }
  }, []);

  const unsubscribe = useCallback((channel: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'unsubscribe',
          channel,
        } as ClientMessage)
      );
    }
  }, []);

  const getAvailability = useCallback(
    (roomTypeId: string, checkInDate: string, checkOutDate: string) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'get-availability',
            roomTypeId,
            checkInDate,
            checkOutDate,
          } as ClientMessage)
        );
      }
    },
    []
  );

  const ping = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'ping',
        } as ClientMessage)
      );
    }
  }, []);

  return {
    isConnected,
    availability,
    bookingNotifications,
    subscribe,
    unsubscribe,
    getAvailability,
    ping,
  };
}
