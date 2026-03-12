import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';
import { RoomStatus } from '@prisma/client';
import { BlobStorageService } from '../storage/blob-storage.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(
    private roomsService: RoomsService,
    private blobStorageService: BlobStorageService,
  ) {}

  @Get('inventory/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all rooms (inventory)' })
  @ApiQuery({ name: 'status', required: false, enum: RoomStatus })
  @ApiQuery({ name: 'roomTypeId', required: false })
  async getRooms(
    @Query('status') status?: RoomStatus,
    @Query('roomTypeId') roomTypeId?: string,
  ) {
    return this.roomsService.getRooms({ status, roomTypeId });
  }

  @Post('inventory')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add physical room' })
  async createRoom(@Body() dto: CreateRoomDto) {
    return this.roomsService.createRoom(dto);
  }

  @Patch('inventory/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.RECEPTIONIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update room status' })
  async updateRoomStatus(
    @Param('id') id: string,
    @Body('status') status: RoomStatus,
  ) {
    return this.roomsService.updateRoomStatus(id, status);
  }

  @Delete('inventory/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete room' })
  async deleteRoom(@Param('id') id: string) {
    return this.roomsService.deleteRoom(id);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all room types (public)' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  async getRoomTypes(
    @Query('type') type?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.roomsService.getRoomTypes({
      type,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get room type by ID' })
  async getRoomType(@Param('id') id: string) {
    return this.roomsService.getRoomTypeById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create room type (admin/manager)' })
  async createRoomType(@Body() dto: CreateRoomTypeDto) {
    return this.roomsService.createRoomType(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update room type' })
  async updateRoomType(@Param('id') id: string, @Body() dto: UpdateRoomTypeDto) {
    return this.roomsService.updateRoomType(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete room type (admin)' })
  async deleteRoomType(@Param('id') id: string) {
    return this.roomsService.deleteRoomType(id);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload images for room type' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'images', maxCount: 3 },
  ]))
  async uploadRoomImages(
    @Param('id') id: string,
    @UploadedFiles() files: { images?: any[] },
  ) {
    if (!files?.images || files.images.length === 0) {
      return { error: 'No images provided' };
    }

    // Limit to 3 images
    const imagesToUpload = files.images.slice(0, 3);
    const uploadedImages = [];

    for (let i = 0; i < imagesToUpload.length; i++) {
      const file = imagesToUpload[i];
      const result = await this.blobStorageService.uploadImage(
        file.buffer,
        `${id}-${Date.now()}-${i}.${file.originalname.split('.').pop()}`,
        file.mimetype,
      );

      uploadedImages.push({
        url: result.url,
        isPrimary: i === 0, // First image is primary
        displayOrder: i,
      });
    }

    // Save images to database
    return this.roomsService.addRoomImages(id, uploadedImages);
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete room type image' })
  async deleteRoomImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.roomsService.deleteRoomImage(id, imageId);
  }
}
