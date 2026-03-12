import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: '/hotels',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private connectedClients: Map<string, { socketId: string; roomId?: string }> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, { socketId: client.id });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const roomId = data.roomId;
    client.join(roomId);
    
    const clientData = this.connectedClients.get(client.id);
    if (clientData) {
      clientData.roomId = roomId;
    }
    
    this.logger.log(`Client ${client.id} joined room: ${roomId}`);
    return { event: 'joined', roomId };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const roomId = data.roomId;
    client.leave(roomId);
    
    const clientData = this.connectedClients.get(client.id);
    if (clientData) {
      clientData.roomId = undefined;
    }
    
    this.logger.log(`Client ${client.id} left room: ${roomId}`);
    return { event: 'left', roomId };
  }

  // ========== Broadcast Methods (for use by services) ==========

  /**
   * Broadcast room availability update to all clients
   */
  broadcastRoomAvailability(roomTypeId: string, data: any) {
    this.server.emit('room:availability', {
      roomTypeId,
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Broadcast room availability for: ${roomTypeId}`);
  }

  /**
   * Broadcast room status change
   */
  broadcastRoomStatus(roomId: string, status: string, data?: any) {
    this.server.emit('room:status', {
      roomId,
      status,
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Broadcast room status: ${roomId} -> ${status}`);
  }

  /**
   * Broadcast booking confirmation
   */
  broadcastBookingConfirmed(bookingId: string, data: any) {
    this.server.emit('booking:confirmed', {
      bookingId,
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Broadcast booking confirmed: ${bookingId}`);
  }

  /**
   * Broadcast new room images added
   */
  broadcastRoomImagesUpdated(roomTypeId: string, images: any[]) {
    this.server.emit('room:images-updated', {
      roomTypeId,
      images,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Broadcast room images updated: ${roomTypeId}`);
  }

  /**
   * Broadcast reservation lock status
   */
  broadcastReservationLock(roomTypeId: string, data: {
    checkIn: string;
    checkOut: string;
    available: boolean;
    lockedQuantity?: number;
  }) {
    this.server.emit('reservation:lock', {
      roomTypeId,
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Broadcast reservation lock for: ${roomTypeId}`);
  }

  /**
   * Broadcast price changes
   */
  broadcastPriceUpdate(roomTypeId: string, newPrice: number) {
    this.server.emit('room:price-update', {
      roomTypeId,
      price: newPrice,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Broadcast price update for: ${roomTypeId} -> ${newPrice}`);
  }

  /**
   * Get connected client count
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}
