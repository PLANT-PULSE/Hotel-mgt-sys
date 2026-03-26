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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rooms_service_1 = require("./rooms.service");
const create_room_type_dto_1 = require("./dto/create-room-type.dto");
const update_room_type_dto_1 = require("./dto/update-room-type.dto");
const create_room_dto_1 = require("./dto/create-room.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
const blob_storage_service_1 = require("../storage/blob-storage.service");
const platform_express_1 = require("@nestjs/platform-express");
let RoomsController = class RoomsController {
    constructor(roomsService, blobStorageService) {
        this.roomsService = roomsService;
        this.blobStorageService = blobStorageService;
    }
    async getRooms(status, roomTypeId) {
        return this.roomsService.getRooms({ status, roomTypeId });
    }
    async createRoom(dto) {
        return this.roomsService.createRoom(dto);
    }
    async updateRoomStatus(id, status) {
        return this.roomsService.updateRoomStatus(id, status);
    }
    async deleteRoom(id) {
        return this.roomsService.deleteRoom(id);
    }
    async getRoomTypes(type, minPrice, maxPrice) {
        return this.roomsService.getRoomTypes({
            type,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        });
    }
    async getRoomType(id) {
        return this.roomsService.getRoomTypeById(id);
    }
    async createRoomType(dto) {
        return this.roomsService.createRoomType(dto);
    }
    async updateRoomType(id, dto) {
        return this.roomsService.updateRoomType(id, dto);
    }
    async deleteRoomType(id) {
        return this.roomsService.deleteRoomType(id);
    }
    async uploadRoomImages(id, files) {
        if (!files?.images || files.images.length === 0) {
            return { error: 'No images provided' };
        }
        const imagesToUpload = files.images.slice(0, 3);
        const uploadedImages = [];
        for (let i = 0; i < imagesToUpload.length; i++) {
            const file = imagesToUpload[i];
            const result = await this.blobStorageService.uploadImage(file.buffer, `${id}-${Date.now()}-${i}.${file.originalname.split('.').pop()}`, file.mimetype);
            uploadedImages.push({
                url: result.url,
                isPrimary: i === 0,
                displayOrder: i,
            });
        }
        return this.roomsService.addRoomImages(id, uploadedImages);
    }
    async deleteRoomImage(id, imageId) {
        return this.roomsService.deleteRoomImage(id, imageId);
    }
};
exports.RoomsController = RoomsController;
__decorate([
    (0, common_1.Get)('inventory/list'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.RECEPTIONIST),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all rooms (inventory)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: client_2.RoomStatus }),
    (0, swagger_1.ApiQuery)({ name: 'roomTypeId', required: false }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('roomTypeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "getRooms", null);
__decorate([
    (0, common_1.Post)('inventory'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add physical room' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_room_dto_1.CreateRoomDto]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Patch)('inventory/:id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.RECEPTIONIST),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update room status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "updateRoomStatus", null);
__decorate([
    (0, common_1.Delete)('inventory/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete room' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "deleteRoom", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all room types (public)' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'minPrice', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'maxPrice', required: false }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('minPrice')),
    __param(2, (0, common_1.Query)('maxPrice')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "getRoomTypes", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get room type by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "getRoomType", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create room type (admin/manager)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_room_type_dto_1.CreateRoomTypeDto]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "createRoomType", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update room type' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_room_type_dto_1.UpdateRoomTypeDto]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "updateRoomType", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete room type (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "deleteRoomType", null);
__decorate([
    (0, common_1.Post)(':id/images'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Upload images for room type' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'images', maxCount: 3 },
    ])),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "uploadRoomImages", null);
__decorate([
    (0, common_1.Delete)(':id/images/:imageId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete room type image' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('imageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "deleteRoomImage", null);
exports.RoomsController = RoomsController = __decorate([
    (0, swagger_1.ApiTags)('rooms'),
    (0, common_1.Controller)('rooms'),
    __metadata("design:paramtypes", [rooms_service_1.RoomsService,
        blob_storage_service_1.BlobStorageService])
], RoomsController);
//# sourceMappingURL=rooms.controller.js.map