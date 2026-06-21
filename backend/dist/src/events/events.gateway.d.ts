import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    private connectedClients;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, data: {
        roomId: string;
    }): {
        event: string;
        roomId: string;
    };
    handleLeaveRoom(client: Socket, data: {
        roomId: string;
    }): {
        event: string;
        roomId: string;
    };
    broadcastRoomAvailability(roomTypeId: string, data: any): void;
    broadcastRoomStatus(roomId: string, status: string, data?: any): void;
    broadcastBookingConfirmed(bookingId: string, data: any): void;
    broadcastRoomImagesUpdated(roomTypeId: string, images: any[]): void;
    broadcastReservationLock(roomTypeId: string, data: {
        checkIn: string;
        checkOut: string;
        available: boolean;
        lockedQuantity?: number;
    }): void;
    broadcastPriceUpdate(roomTypeId: string, newPrice: number): void;
    getConnectedClientsCount(): number;
}
