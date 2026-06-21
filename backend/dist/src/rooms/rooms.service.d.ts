import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomStatus } from '@prisma/client';
import { BlobStorageService } from '../storage/blob-storage.service';
export declare class RoomsService {
    private prisma;
    private blobStorageService?;
    constructor(prisma: PrismaService, blobStorageService?: BlobStorageService | undefined);
    getRoomTypes(filters?: {
        type?: string;
        minPrice?: number;
        maxPrice?: number;
    }): Promise<{
        roomsLeft: number;
        images: {
            id: string;
            createdAt: Date;
            roomTypeId: string;
            url: string;
            altText: string | null;
            isPrimary: boolean;
            displayOrder: number;
        }[] | {
            url: string;
            isPrimary: boolean;
        }[];
        status: string;
        rooms: {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.RoomStatus;
            roomTypeId: string;
            floor: number;
        }[];
        _count: {
            rooms: number;
        };
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        description: string | null;
        businessId: string;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        size: string;
        maxGuests: number;
        beds: number;
        amenities: string[];
        image: string | null;
        totalUnits: number;
    }[]>;
    getRoomTypeById(id: string): Promise<{
        roomsLeft: number;
        images: {
            id: string;
            createdAt: Date;
            roomTypeId: string;
            url: string;
            altText: string | null;
            isPrimary: boolean;
            displayOrder: number;
        }[] | {
            url: string;
            isPrimary: boolean;
        }[];
        rooms: {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.RoomStatus;
            roomTypeId: string;
            floor: number;
        }[];
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        description: string | null;
        businessId: string;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        size: string;
        maxGuests: number;
        beds: number;
        amenities: string[];
        image: string | null;
        totalUnits: number;
    }>;
    createRoomType(dto: CreateRoomTypeDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        description: string | null;
        businessId: string;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        size: string;
        maxGuests: number;
        beds: number;
        amenities: string[];
        image: string | null;
        totalUnits: number;
    }>;
    updateRoomType(id: string, dto: UpdateRoomTypeDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        description: string | null;
        businessId: string;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        size: string;
        maxGuests: number;
        beds: number;
        amenities: string[];
        image: string | null;
        totalUnits: number;
    }>;
    deleteRoomType(id: string): Promise<{
        message: string;
    }>;
    getRooms(filters?: {
        status?: RoomStatus;
        roomTypeId?: string;
    }): Promise<({
        roomType: {
            images: {
                id: string;
                createdAt: Date;
                roomTypeId: string;
                url: string;
                altText: string | null;
                isPrimary: boolean;
                displayOrder: number;
            }[];
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: string;
            description: string | null;
            businessId: string;
            basePrice: import("@prisma/client/runtime/library").Decimal;
            size: string;
            maxGuests: number;
            beds: number;
            amenities: string[];
            image: string | null;
            totalUnits: number;
        };
    } & {
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RoomStatus;
        roomTypeId: string;
        floor: number;
    })[]>;
    createRoom(dto: CreateRoomDto): Promise<{
        roomType: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: string;
            description: string | null;
            businessId: string;
            basePrice: import("@prisma/client/runtime/library").Decimal;
            size: string;
            maxGuests: number;
            beds: number;
            amenities: string[];
            image: string | null;
            totalUnits: number;
        };
    } & {
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RoomStatus;
        roomTypeId: string;
        floor: number;
    }>;
    updateRoomStatus(id: string, status: RoomStatus): Promise<{
        number: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RoomStatus;
        roomTypeId: string;
        floor: number;
    }>;
    deleteRoom(id: string): Promise<{
        message: string;
    }>;
    addRoomImages(roomTypeId: string, images: {
        url: string;
        isPrimary: boolean;
        displayOrder: number;
    }[]): Promise<{
        message: string;
        roomTypeId: string;
    }>;
    deleteRoomImage(roomTypeId: string, imageId: string): Promise<{
        message: string;
    }>;
}
