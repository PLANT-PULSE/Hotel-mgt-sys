import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomStatus } from '@prisma/client';
import { BlobStorageService } from '../storage/blob-storage.service';

@Injectable()
export class RoomsService {
  constructor(
    private prisma: PrismaService,
    private blobStorageService?: BlobStorageService,
  ) {}

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
        images: {
          orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
        },
        _count: { select: { rooms: true } },
      },
    });

    return roomTypes.map((rt) => ({
      ...rt,
      roomsLeft: rt.rooms.length,
      images: rt.images.length > 0 ? rt.images : (rt.image ? [{ url: rt.image, isPrimary: true }] : []),
      status: 'available',
    }));
  }

  async getRoomTypeById(id: string) {
    const rt = await this.prisma.roomType.findUnique({
      where: { id },
      include: { rooms: true, images: true },
    });
    if (!rt) throw new NotFoundException('Room type not found');
    const availableCount = rt.rooms.filter((r) => r.status === RoomStatus.AVAILABLE).length;
    return { 
      ...rt, 
      roomsLeft: availableCount,
      images: rt.images.length > 0 ? rt.images : (rt.image ? [{ url: rt.image, isPrimary: true }] : []),
    };
  }

  async createRoomType(dto: CreateRoomTypeDto) {
    const totalUnits = dto.totalUnits ?? 1;

    let businessId = dto.businessId;
    if (!businessId) {
      const defaultBusiness = await this.prisma.business.findFirst({
        where: { status: 'ACTIVE' },
        select: { id: true },
      });
      if (!defaultBusiness) {
        throw new BadRequestException('No active business found. Provide businessId.');
      }
      businessId = defaultBusiness.id;
    }

    const roomType = await this.prisma.roomType.create({
      data: {
        businessId,
        name: dto.name,
        type: dto.type,
        basePrice: dto.basePrice,
        size: dto.size,
        maxGuests: dto.maxGuests,
        beds: dto.beds,
        amenities: dto.amenities,
        description: dto.description,
        image: dto.image,
        totalUnits,
      },
    });

    for (let i = 0; i < totalUnits; i++) {
      const roomNumber = `${roomType.name.replace(/\s+/g, '').slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`;
      await this.prisma.room.create({
        data: {
          roomTypeId: roomType.id,
          number: `${roomNumber}-${Date.now().toString().slice(-4)}`,
          floor: 1,
        },
      });
    }

    return roomType;
  }

  async updateRoomType(id: string, dto: UpdateRoomTypeDto) {
    await this.getRoomTypeById(id);
    return this.prisma.roomType.update({
      where: { id },
      data: dto,
    });
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
      include: { 
        roomType: {
          include: {
            images: {
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
      orderBy: [{ floor: 'asc' }, { number: 'asc' }],
    });
  }

  async createRoom(dto: CreateRoomDto) {
    const room = await this.prisma.room.create({
      data: {
        roomTypeId: dto.roomTypeId,
        number: dto.number,
        floor: dto.floor,
      },
      include: { roomType: true },
    });

    await this.prisma.roomType.update({
      where: { id: dto.roomTypeId },
      data: { totalUnits: { increment: 1 } },
    });

    return room;
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
    await this.prisma.roomType.update({
      where: { id: room.roomTypeId },
      data: { totalUnits: { decrement: 1 } },
    });
    return { message: 'Room deleted' };
  }

  async addRoomImages(roomTypeId: string, images: { url: string; isPrimary: boolean; displayOrder: number }[]) {
    // Get existing image count
    const existingCount = await this.prisma.roomImage.count({ where: { roomTypeId } });
    
    // If there are already images, we need to manage primary status
    if (existingCount > 0) {
      // If any new image is primary, unset existing primary
      const hasNewPrimary = images.some(img => img.isPrimary);
      if (hasNewPrimary) {
        await this.prisma.roomImage.updateMany({
          where: { roomTypeId, isPrimary: true },
          data: { isPrimary: false },
        });
      }
    }
    
    // Create new images
    const createdImages = await this.prisma.roomImage.createMany({
      data: images.map(img => ({
        roomTypeId,
        url: img.url,
        isPrimary: img.isPrimary,
        displayOrder: img.displayOrder + existingCount, // Offset by existing count
      })),
    });
    
    return {
      message: `Added ${createdImages.count} images`,
      roomTypeId,
    };
  }

  async deleteRoomImage(roomTypeId: string, imageId: string) {
    const image = await this.prisma.roomImage.findFirst({
      where: { id: imageId, roomTypeId },
    });
    
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    
    // Delete from blob storage if URL is from blob
    if (image.url && !image.url.startsWith('/')) {
      try {
        await this.blobStorageService?.deleteImage(image.url);
      } catch (e) {
        console.error('Failed to delete blob image:', e);
      }
    }
    
    await this.prisma.roomImage.delete({ where: { id: imageId } });
    
    // If deleted image was primary, set another image as primary
    if (image.isPrimary) {
      const remainingImages = await this.prisma.roomImage.findFirst({
        where: { roomTypeId },
        orderBy: { displayOrder: 'asc' },
      });
      
      if (remainingImages) {
        await this.prisma.roomImage.update({
          where: { id: remainingImages.id },
          data: { isPrimary: true },
        });
      }
    }
    
    return { message: 'Image deleted' };
  }
}
