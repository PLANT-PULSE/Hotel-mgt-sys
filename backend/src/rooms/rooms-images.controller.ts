import {
  Controller,
  Post,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Body,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { RoomsService } from './rooms.service';
import { BlobService } from '../storage/blob.service';
import { RoomsGateway } from '../websocket/rooms.gateway';

@ApiTags('rooms')
@Controller('rooms/images')
export class RoomsImagesController {
  private logger = new Logger(RoomsImagesController.name);

  constructor(
    private roomsService: RoomsService,
    private blobService: BlobService,
    private roomsGateway: RoomsGateway,
  ) {}

  @Post(':roomTypeId/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 files
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload room images to Blob storage' })
  async uploadRoomImages(
    @Param('roomTypeId') roomTypeId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('No images provided');
      }

      // Verify room type exists
      const roomType = await this.roomsService.getRoomTypeById(roomTypeId);
      if (!roomType) {
        throw new BadRequestException('Room type not found');
      }

      // Upload files to Blob
      const uploadedUrls = await this.blobService.uploadFiles(files, 'rooms');

      // Update room type with new images
      const currentImages = roomType.images || [];
      const updatedImages = [...currentImages, ...uploadedUrls];

      const updatedRoomType = await this.roomsService.updateRoomType(roomTypeId, {
        images: updatedImages,
      });

      // Broadcast room update via WebSocket
      this.roomsGateway.broadcastRoomUpdate({
        roomTypeId,
        name: updatedRoomType.name,
        basePrice: updatedRoomType.basePrice,
        image: updatedRoomType.image,
        images: updatedRoomType.images,
        amenities: updatedRoomType.amenities,
        description: updatedRoomType.description,
        updatedAt: updatedRoomType.updatedAt,
      });

      this.logger.log(`Images uploaded for room ${roomTypeId}: ${uploadedUrls.length} files`);

      return {
        success: true,
        message: `${uploadedUrls.length} images uploaded successfully`,
        imageUrls: uploadedUrls,
        totalImages: updatedImages.length,
      };
    } catch (error) {
      this.logger.error(`Failed to upload images: ${error}`);
      throw error;
    }
  }

  @Patch(':roomTypeId/remove-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove image from room' })
  async removeRoomImage(
    @Param('roomTypeId') roomTypeId: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    try {
      if (!imageUrl) {
        throw new BadRequestException('Image URL is required');
      }

      // Get room type
      const roomType = await this.roomsService.getRoomTypeById(roomTypeId);
      if (!roomType) {
        throw new BadRequestException('Room type not found');
      }

      // Remove image from array
      const updatedImages = (roomType.images || []).filter(img => img !== imageUrl);

      // Delete from Blob storage
      await this.blobService.deleteFile(imageUrl);

      // Update room type
      const updatedRoomType = await this.roomsService.updateRoomType(roomTypeId, {
        images: updatedImages,
      });

      // Broadcast room update via WebSocket
      this.roomsGateway.broadcastRoomUpdate({
        roomTypeId,
        name: updatedRoomType.name,
        basePrice: updatedRoomType.basePrice,
        image: updatedRoomType.image,
        images: updatedRoomType.images,
        amenities: updatedRoomType.amenities,
        description: updatedRoomType.description,
        updatedAt: updatedRoomType.updatedAt,
      });

      this.logger.log(`Image removed from room ${roomTypeId}: ${imageUrl}`);

      return {
        success: true,
        message: 'Image removed successfully',
        totalImages: updatedImages.length,
      };
    } catch (error) {
      this.logger.error(`Failed to remove image: ${error}`);
      throw error;
    }
  }
}
