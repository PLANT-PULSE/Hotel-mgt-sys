import { RoomsService } from './rooms.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomStatus } from '@prisma/client';
import { BlobStorageService } from '../storage/blob-storage.service';
export declare class RoomsController {
    private roomsService;
    private blobStorageService;
    constructor(roomsService: RoomsService, blobStorageService: BlobStorageService);
    getRooms(status?: RoomStatus, roomTypeId?: string): Promise<({
        roomType: {
            images: {
                roomTypeId: string;
                id: string;
                createdAt: Date;
                displayOrder: number;
                url: string;
                altText: string | null;
                isPrimary: boolean;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: string;
            basePrice: import("@prisma/client/runtime/library").Decimal;
            size: string;
            maxGuests: number;
            beds: number;
            amenities: string[];
            description: string | null;
            image: string | null;
            totalUnits: number;
        };
    } & {
        number: string;
        status: import(".prisma/client").$Enums.RoomStatus;
        roomTypeId: string;
        id: string;
        floor: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createRoom(dto: CreateRoomDto): Promise<{
        roomType: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: string;
            basePrice: import("@prisma/client/runtime/library").Decimal;
            size: string;
            maxGuests: number;
            beds: number;
            amenities: string[];
            description: string | null;
            image: string | null;
            totalUnits: number;
        };
    } & {
        number: string;
        status: import(".prisma/client").$Enums.RoomStatus;
        roomTypeId: string;
        id: string;
        floor: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateRoomStatus(id: string, status: RoomStatus): Promise<{
        number: string;
        status: import(".prisma/client").$Enums.RoomStatus;
        roomTypeId: string;
        id: string;
        floor: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteRoom(id: string): Promise<{
        message: string;
    }>;
    getRoomTypes(type?: string, minPrice?: string, maxPrice?: string): Promise<{
        roomsLeft: number;
        images: {
            roomTypeId: string;
            id: string;
            createdAt: Date;
            displayOrder: number;
            url: string;
            altText: string | null;
            isPrimary: boolean;
        }[] | {
            url: string;
            isPrimary: boolean;
        }[];
        status: string;
        _count: {
            rooms: number;
        };
        rooms: {
            number: string;
            status: import(".prisma/client").$Enums.RoomStatus;
            roomTypeId: string;
            id: string;
            floor: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        size: string;
        maxGuests: number;
        beds: number;
        amenities: string[];
        description: string | null;
        image: string | null;
        totalUnits: number;
    }[]>;
    getRoomType(id: string): Promise<{
        roomsLeft: number;
        images: {
            roomTypeId: string;
            id: string;
            createdAt: Date;
            displayOrder: number;
            url: string;
            altText: string | null;
            isPrimary: boolean;
        }[] | {
            url: string;
            isPrimary: boolean;
        }[];
        rooms: {
            number: string;
            status: import(".prisma/client").$Enums.RoomStatus;
            roomTypeId: string;
            id: string;
            floor: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        size: string;
        maxGuests: number;
        beds: number;
        amenities: string[];
        description: string | null;
        image: string | null;
        totalUnits: number;
    }>;
    createRoomType(dto: CreateRoomTypeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        size: string;
        maxGuests: number;
        beds: number;
        amenities: string[];
        description: string | null;
        image: string | null;
        totalUnits: number;
    }>;
    updateRoomType(id: string, dto: UpdateRoomTypeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        size: string;
        maxGuests: number;
        beds: number;
        amenities: string[];
        description: string | null;
        image: string | null;
        totalUnits: number;
    }>;
    deleteRoomType(id: string): Promise<{
        message: string;
    }>;
    uploadRoomImages(id: string, files: {
        images?: any[];
    }): Promise<{
        message: string;
        roomTypeId: string;
    } | {
        error: string;
    }>;
    deleteRoomImage(id: string, imageId: string): Promise<{
        message: string;
    }>;
}
