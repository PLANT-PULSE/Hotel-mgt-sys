import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

interface PongMessage {
  type: 'pong';
  timestamp: string;
}

type WebSocketMessage = AvailabilityUpdate | BookingNotification | PongMessage;

class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<WebSocket, Set<string>> = new Map();
  private subscriptions: Map<string, Set<WebSocket>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(httpServer: HTTPServer) {
    this.wss = new WebSocketServer({ server: httpServer });
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('[WebSocket] Client connected');
      this.clients.set(ws, new Set());

      ws.on('message', (data: string) => {
        this.handleMessage(ws, data);
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('[WebSocket] Client error:', error);
        this.handleDisconnect(ws);
      });

      // Send welcome message
      this.sendToClient(ws, {
        type: 'pong',
        timestamp: new Date().toISOString(),
      });
    });

    // Start heartbeat
    this.startHeartbeat();
  }

  private handleMessage(ws: WebSocket, data: string) {
    try {
      const message: ClientMessage = JSON.parse(data);

      switch (message.type) {
        case 'subscribe':
          this.subscribe(ws, message.channel || '');
          break;

        case 'unsubscribe':
          this.unsubscribe(ws, message.channel || '');
          break;

        case 'get-availability':
          this.sendAvailability(ws, message);
          break;

        case 'ping':
          this.sendToClient(ws, {
            type: 'pong',
            timestamp: new Date().toISOString(),
          });
          break;

        default:
          console.warn('[WebSocket] Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('[WebSocket] Message parsing error:', error);
    }
  }

  private subscribe(ws: WebSocket, channel: string) {
    const channels = this.clients.get(ws) || new Set();
    channels.add(channel);
    this.clients.set(ws, channels);

    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)!.add(ws);

    console.log(`[WebSocket] Client subscribed to ${channel}`);
  }

  private unsubscribe(ws: WebSocket, channel: string) {
    const channels = this.clients.get(ws);
    if (channels) {
      channels.delete(channel);
    }

    const subscribers = this.subscriptions.get(channel);
    if (subscribers) {
      subscribers.delete(ws);
    }

    console.log(`[WebSocket] Client unsubscribed from ${channel}`);
  }

  private async sendAvailability(
    ws: WebSocket,
    message: ClientMessage
  ) {
    if (!message.roomTypeId || !message.checkInDate || !message.checkOutDate) {
      return;
    }

    try {
      const room = await prisma.roomType.findUnique({
        where: { id: message.roomTypeId },
      });

      if (!room) return;

      const checkIn = new Date(message.checkInDate);
      const checkOut = new Date(message.checkOutDate);

      const bookedUnits = await prisma.bookingItem.count({
        where: {
          roomTypeId: message.roomTypeId,
          booking: {
            status: {
              in: ['CONFIRMED', 'CHECKED_IN'],
            },
            checkInDate: { lt: checkOut },
            checkOutDate: { gt: checkIn },
          },
        },
      });

      const availableUnits = room.totalUnits - bookedUnits;

      this.sendToClient(ws, {
        type: 'availability-update',
        roomTypeId: message.roomTypeId,
        availableUnits,
        totalUnits: room.totalUnits,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[WebSocket] Error fetching availability:', error);
    }
  }

  private handleDisconnect(ws: WebSocket) {
    const channels = this.clients.get(ws);
    if (channels) {
      channels.forEach((channel) => {
        const subscribers = this.subscriptions.get(channel);
        if (subscribers) {
          subscribers.delete(ws);
        }
      });
    }
    this.clients.delete(ws);
    console.log('[WebSocket] Client disconnected');
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws: WebSocket) => {
        if (!ws.isAlive) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds
  }

  public broadcast(message: WebSocketMessage, channel?: string) {
    if (channel) {
      const subscribers = this.subscriptions.get(channel) || new Set();
      subscribers.forEach((ws) => {
        this.sendToClient(ws, message);
      });
    } else {
      this.wss.clients.forEach((ws: WebSocket) => {
        this.sendToClient(ws, message);
      });
    }
  }

  public broadcastAvailabilityUpdate(
    roomTypeId: string,
    availableUnits: number,
    totalUnits: number
  ) {
    const channel = `room:${roomTypeId}`;
    this.broadcast(
      {
        type: 'availability-update',
        roomTypeId,
        availableUnits,
        totalUnits,
        timestamp: new Date().toISOString(),
      },
      channel
    );
  }

  public broadcastBookingNotification(
    type: 'booking-created' | 'booking-confirmed' | 'booking-cancelled',
    bookingNumber: string,
    roomTypeId: string,
    guestEmail: string
  ) {
    const channel = `room:${roomTypeId}`;
    this.broadcast(
      {
        type,
        bookingNumber,
        roomTypeId,
        guestEmail,
        timestamp: new Date().toISOString(),
      },
      channel
    );
  }

  private sendToClient(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  public close() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.wss.close();
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null;

export function initializeWebSocketServer(httpServer: HTTPServer): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(httpServer);
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return wsManager;
}

export { WebSocketManager };
