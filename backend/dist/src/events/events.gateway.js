"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EventsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let EventsGateway = EventsGateway_1 = class EventsGateway {
    constructor() {
        this.logger = new common_1.Logger(EventsGateway_1.name);
        this.connectedClients = new Map();
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        this.connectedClients.set(client.id, { socketId: client.id });
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.connectedClients.delete(client.id);
    }
    handleJoinRoom(client, data) {
        const roomId = data.roomId;
        client.join(roomId);
        const clientData = this.connectedClients.get(client.id);
        if (clientData) {
            clientData.roomId = roomId;
        }
        this.logger.log(`Client ${client.id} joined room: ${roomId}`);
        return { event: 'joined', roomId };
    }
    handleLeaveRoom(client, data) {
        const roomId = data.roomId;
        client.leave(roomId);
        const clientData = this.connectedClients.get(client.id);
        if (clientData) {
            clientData.roomId = undefined;
        }
        this.logger.log(`Client ${client.id} left room: ${roomId}`);
        return { event: 'left', roomId };
    }
    broadcastRoomAvailability(roomTypeId, data) {
        this.server.emit('room:availability', {
            roomTypeId,
            ...data,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(`Broadcast room availability for: ${roomTypeId}`);
    }
    broadcastRoomStatus(roomId, status, data) {
        this.server.emit('room:status', {
            roomId,
            status,
            ...data,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(`Broadcast room status: ${roomId} -> ${status}`);
    }
    broadcastBookingConfirmed(bookingId, data) {
        this.server.emit('booking:confirmed', {
            bookingId,
            ...data,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(`Broadcast booking confirmed: ${bookingId}`);
    }
    broadcastRoomImagesUpdated(roomTypeId, images) {
        this.server.emit('room:images-updated', {
            roomTypeId,
            images,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(`Broadcast room images updated: ${roomTypeId}`);
    }
    broadcastReservationLock(roomTypeId, data) {
        this.server.emit('reservation:lock', {
            roomTypeId,
            ...data,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(`Broadcast reservation lock for: ${roomTypeId}`);
    }
    broadcastPriceUpdate(roomTypeId, newPrice) {
        this.server.emit('room:price-update', {
            roomTypeId,
            price: newPrice,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(`Broadcast price update for: ${roomTypeId} -> ${newPrice}`);
    }
    getConnectedClientsCount() {
        return this.connectedClients.size;
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleLeaveRoom", null);
exports.EventsGateway = EventsGateway = EventsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
        namespace: '/hotels',
    })
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map