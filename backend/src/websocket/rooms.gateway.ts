import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface RoomUpdate {
  roomTypeId: string;
  name: string;
  basePrice: number;
  image: string;
  images: string[];
  amenities: string[];
  description: string;
  basePrice: number;
  updatedAt: Date;
}

interface BookingUpdate {
  bookingId: string;
  status: string;
  roomTypeId: string;
  checkInDate: Date;
  checkOutDate: Date;
  updatedAt: Date;
}

@WebSocketGateway({
  namespace: 'rooms',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class RoomsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger = new Logger(RoomsGateway.name);
  private connectedClients = new Set<string>();

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket) {
    this.connectedClients.add(client.id);
    this.logger.log(`Client connected: ${client.id}. Total: ${this.connectedClients.size}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}. Total: ${this.connectedClients.size}`);
  }

  /**
   * Client subscribes to room updates
   */
  @SubscribeMessage('subscribe-room')
  handleRoomSubscription(client: Socket, roomTypeId: string) {
    const roomChannel = `room:${roomTypeId}`;
    client.join(roomChannel);
    this.logger.log(`Client ${client.id} subscribed to ${roomChannel}`);
  }

  /**
   * Client unsubscribes from room updates
   */
  @SubscribeMessage('unsubscribe-room')
  handleRoomUnsubscription(client: Socket, roomTypeId: string) {
    const roomChannel = `room:${roomTypeId}`;
    client.leave(roomChannel);
    this.logger.log(`Client ${client.id} unsubscribed from ${roomChannel}`);
  }

  /**
   * Broadcast room information update to all connected clients
   */
  broadcastRoomUpdate(update: RoomUpdate) {
    const roomChannel = `room:${update.roomTypeId}`;
    this.server.to(roomChannel).emit('room-updated', update);
    this.logger.log(`Room update broadcasted for ${update.roomTypeId}`);
  }

  /**
   * Broadcast booking status update
   */
  broadcastBookingUpdate(update: BookingUpdate) {
    const bookingChannel = 'bookings';
    this.server.to(bookingChannel).emit('booking-updated', update);
    this.logger.log(`Booking update broadcasted: ${update.bookingId}`);
  }

  /**
   * Broadcast availability change
   */
  broadcastAvailabilityChange(roomTypeId: string, available: boolean) {
    const roomChannel = `room:${roomTypeId}`;
    this.server.to(roomChannel).emit('availability-changed', {
      roomTypeId,
      available,
      timestamp: new Date(),
    });
    this.logger.log(
      `Availability changed for ${roomTypeId}: ${available ? 'Available' : 'Unavailable'}`,
    );
  }

  /**
   * Broadcast price update
   */
  broadcastPriceUpdate(roomTypeId: string, newPrice: number) {
    const roomChannel = `room:${roomTypeId}`;
    this.server.to(roomChannel).emit('price-updated', {
      roomTypeId,
      newPrice,
      timestamp: new Date(),
    });
    this.logger.log(`Price update for ${roomTypeId}: ${newPrice}`);
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}
