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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const blob_storage_service_1 = require("../storage/blob-storage.service");
let RoomsService = class RoomsService {
    constructor(prisma, blobStorageService) {
        this.prisma = prisma;
        this.blobStorageService = blobStorageService;
    }
    async getRoomTypes(filters) {
        const where = {};
        if (filters?.type)
            where.type = filters.type;
        if (filters?.minPrice != null || filters?.maxPrice != null) {
            where.basePrice = {};
            if (filters.minPrice != null)
                where.basePrice.gte = filters.minPrice;
            if (filters.maxPrice != null)
                where.basePrice.lte = filters.maxPrice;
        }
        const roomTypes = await this.prisma.roomType.findMany({
            where,
            include: {
                rooms: { where: { status: client_1.RoomStatus.AVAILABLE } },
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
    async getRoomTypeById(id) {
        const rt = await this.prisma.roomType.findUnique({
            where: { id },
            include: { rooms: true, images: true },
        });
        if (!rt)
            throw new common_1.NotFoundException('Room type not found');
        const availableCount = rt.rooms.filter((r) => r.status === client_1.RoomStatus.AVAILABLE).length;
        return {
            ...rt,
            roomsLeft: availableCount,
            images: rt.images.length > 0 ? rt.images : (rt.image ? [{ url: rt.image, isPrimary: true }] : []),
        };
    }
    async createRoomType(dto) {
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
    async updateRoomType(id, dto) {
        await this.getRoomTypeById(id);
        return this.prisma.roomType.update({
            where: { id },
            data: dto,
        });
    }
    async deleteRoomType(id) {
        await this.getRoomTypeById(id);
        await this.prisma.roomType.delete({ where: { id } });
        return { message: 'Room type deleted' };
    }
    async getRooms(filters) {
        const where = {};
        if (filters?.status)
            where.status = filters.status;
        if (filters?.roomTypeId)
            where.roomTypeId = filters.roomTypeId;
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
    async createRoom(dto) {
        return this.prisma.room.create({
            data: {
                roomTypeId: dto.roomTypeId,
                number: dto.number,
                floor: dto.floor,
            },
            include: { roomType: true },
        });
    }
    async updateRoomStatus(id, status) {
        const room = await this.prisma.room.findUnique({ where: { id } });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        return this.prisma.room.update({
            where: { id },
            data: { status },
        });
    }
    async deleteRoom(id) {
        const room = await this.prisma.room.findUnique({ where: { id } });
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        await this.prisma.room.delete({ where: { id } });
        return { message: 'Room deleted' };
    }
    async addRoomImages(roomTypeId, images) {
        const existingCount = await this.prisma.roomImage.count({ where: { roomTypeId } });
        if (existingCount > 0) {
            const hasNewPrimary = images.some(img => img.isPrimary);
            if (hasNewPrimary) {
                await this.prisma.roomImage.updateMany({
                    where: { roomTypeId, isPrimary: true },
                    data: { isPrimary: false },
                });
            }
        }
        const createdImages = await this.prisma.roomImage.createMany({
            data: images.map(img => ({
                roomTypeId,
                url: img.url,
                isPrimary: img.isPrimary,
                displayOrder: img.displayOrder + existingCount,
            })),
        });
        return {
            message: `Added ${createdImages.count} images`,
            roomTypeId,
        };
    }
    async deleteRoomImage(roomTypeId, imageId) {
        const image = await this.prisma.roomImage.findFirst({
            where: { id: imageId, roomTypeId },
        });
        if (!image) {
            throw new common_1.NotFoundException('Image not found');
        }
        if (image.url && !image.url.startsWith('/')) {
            try {
                await this.blobStorageService?.deleteImage(image.url);
            }
            catch (e) {
                console.error('Failed to delete blob image:', e);
            }
        }
        await this.prisma.roomImage.delete({ where: { id: imageId } });
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
};
exports.RoomsService = RoomsService;
exports.RoomsService = RoomsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        blob_storage_service_1.BlobStorageService])
], RoomsService);
//# sourceMappingURL=rooms.service.js.map