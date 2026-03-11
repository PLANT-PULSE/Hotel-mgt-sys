import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { put, del } from '@vercel/blob';

@Injectable()
export class BlobService {
  private logger = new Logger(BlobService.name);

  constructor() {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not set');
    }
  }

  /**
   * Upload a single file to Vercel Blob
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'rooms',
  ): Promise<string> {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      // Validate file type (image only)
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('Only image files are allowed (JPEG, PNG, WebP, GIF)');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new BadRequestException('File size must not exceed 5MB');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.originalname.split('.').pop();
      const filename = `${timestamp}-${randomString}.${extension}`;
      const blobPath = `${folder}/${filename}`;

      // Upload to Vercel Blob
      const blob = await put(blobPath, file.buffer, {
        access: 'public',
        addRandomSuffix: false,
      });

      this.logger.log(`File uploaded successfully: ${blob.url}`);
      return blob.url;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to upload file');
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder: string = 'rooms',
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      try {
        const url = await this.uploadFile(file, folder);
        uploadedUrls.push(url);
      } catch (error) {
        this.logger.warn(`Failed to upload individual file: ${error}`);
        // Continue with other files
      }
    }

    if (uploadedUrls.length === 0) {
      throw new BadRequestException('Failed to upload any files');
    }

    return uploadedUrls;
  }

  /**
   * Delete a file from Vercel Blob by URL
   */
  async deleteFile(url: string): Promise<void> {
    try {
      if (!url) {
        throw new BadRequestException('URL is required');
      }

      await del(url);
      this.logger.log(`File deleted successfully: ${url}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error}`);
      throw new BadRequestException('Failed to delete file');
    }
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(urls: string[]): Promise<void> {
    if (!urls || urls.length === 0) {
      throw new BadRequestException('No URLs provided');
    }

    for (const url of urls) {
      try {
        await this.deleteFile(url);
      } catch (error) {
        this.logger.warn(`Failed to delete individual file: ${error}`);
        // Continue with other files
      }
    }
  }
}
