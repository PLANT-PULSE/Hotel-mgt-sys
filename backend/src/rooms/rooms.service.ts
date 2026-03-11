import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomStatus } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async getRoomTypes(filters?: { type?: string; minPrice?: number; maxPrice?: number }) {
    const where: Record<string, unknown> = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.minPrice != null || filters?.maxPrice != null) {
      where.basePrice = {};
      if (filters.minPrice != null) (where.basePrice as Record<string, number>).gte = filters.minPrice;
      if (filters.maxPrice != null) (where.basePrice as Record<string, number>).lte = filters.maxPrice;
    }

    const roomTypes = await this.prisma.roomType.findMany({
      where,
      include: {
        rooms: { where: { status: RoomStatus.AVAILABLE } },
        _count: { select: { rooms: true } },
      },
    });

    return roomTypes.map((rt) => ({
      ...rt,
      roomsLeft: rt.rooms.filter((r) => r.status === RoomStatus.AVAILABLE).length,
      status: 'available',
    }));
  }

  async getRoomTypeById(id: string) {
    const rt = await this.prisma.roomType.findUnique({
      where: { id },
      include: { rooms: true },
    });
    if (!rt) throw new NotFoundException('Room type not found');
    const availableCount = rt.rooms.filter((r) => r.status === RoomStatus.AVAILABLE).length;
    return { ...rt, roomsLeft: availableCount };
  }

  async createRoomType(dto: CreateRoomTypeDto) {
    return this.prisma.roomType.create({
      data: {
        name: dto.name,
        type: dto.type,
        basePrice: dto.basePrice,
        size: dto.size,
        maxGuests: dto.maxGuests,
        beds: dto.beds,
        amenities: dto.amenities,
        description: dto.description,
        image: dto.image,
        totalUnits: dto.totalUnits ?? 1,
      },
    });
  }

  async updateRoomType(id: string, dto: UpdateRoomTypeDto) {
    await this.getRoomTypeById(id);
    const updated = await this.prisma.roomType.update({
      where: { id },
      data: dto,
    });
    // NOTE: WebSocket broadcast will be handled by controller to avoid circular dependency
    return updated;
  }

  async deleteRoomType(id: string) {
    await this.getRoomTypeById(id);
    await this.prisma.roomType.delete({ where: { id } });
    return { message: 'Room type deleted' };
  }

  async getRooms(filters?: { status?: RoomStatus; roomTypeId?: string }) {
    const where: Record<string, unknown> = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.roomTypeId) where.roomTypeId = filters.roomTypeId;

    return this.prisma.room.findMany({
      where,
      include: { roomType: true },
      orderBy: [{ floor: 'asc' }, { number: 'asc' }],
    });
  }

  async createRoom(dto: CreateRoomDto) {
    return this.prisma.room.create({
      data: {
        roomTypeId: dto.roomTypeId,
        number: dto.number,
        floor: dto.floor,
      },
      include: { roomType: true },
    });
  }

  async updateRoomStatus(id: string, status: RoomStatus) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    return this.prisma.room.update({
      where: { id },
      data: { status },
    });
  }

  async deleteRoom(id: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    await this.prisma.room.delete({ where: { id } });
    return { message: 'Room deleted' };
  }
}
