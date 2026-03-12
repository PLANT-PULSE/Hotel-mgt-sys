import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Vercel Blob import - using the newer API
// If this causes issues, you can use a simpler approach with direct HTTP calls
let BlobClient: any;
try {
  // Try to import Vercel Blob
  const blobModule = require('@vercel/blob');
  BlobClient = blobModule;
} catch (e) {
  console.warn('@vercel/blob not available, using fallback');
}

@Injectable()
export class BlobStorageService {
  private blobToken: string;
  private bucketName: string;
  private blobUrl: string;

  constructor(private configService: ConfigService) {
    this.blobToken = this.configService.get<string>('BLOB_READ_WRITE_TOKEN') || '';
    this.bucketName = this.configService.get<string>('BLOB_BUCKET_NAME') || 'hotel-images';
    this.blobUrl = `https://public.blob.vercel-storage.com`;
  }

  /**
   * Upload an image to Vercel Blob storage using direct API
   */
  async uploadImage(
    file: Buffer,
    filename: string,
    contentType: string,
  ): Promise<{ url: string; pathname: string }> {
    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(contentType)) {
      throw new BadRequestException('Invalid image format. Allowed: JPEG, PNG, WebP, GIF');
    }

    // Validate file size (max 5MB)
    if (file.length > 5 * 1024 * 1024) {
      throw new BadRequestException('File size too large. Maximum 5MB allowed');
    }

    if (!this.blobToken) {
      // Return placeholder URL if blob not configured
      const placeholderUrl = `/placeholder.jpg`;
      return { url: placeholderUrl, pathname: filename };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `rooms/${timestamp}-${sanitizedFilename}`;

    try {
      // Use Vercel Blob API directly
      if (BlobClient && BlobClient.put) {
        const blob = await BlobClient.put(path, file, {
          contentType,
          access: 'public',
          token: this.blobToken,
        });
        return { url: blob.url, pathname: blob.pathname };
      }

      // Fallback: use direct HTTP upload
      const response = await fetch(`${this.blobUrl}/${this.bucketName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.blobToken}`,
          'Content-Type': contentType,
          'x-blob-path': path,
        },
        body: file,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Upload failed: ${error}`);
      }

      const result = await response.json();
      return { url: result.url, pathname: result.pathname };
    } catch (error) {
      console.error('Blob upload error:', error);
      // Return placeholder on error
      return { url: '/placeholder.jpg', pathname: path };
    }
  }

  /**
   * Upload image from base64 string
   */
  async uploadFromBase64(
    base64Data: string,
    filename: string,
  ): Promise<{ url: string; pathname: string }> {
    // Extract content type from base64 data
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new BadRequestException('Invalid base64 data format');
    }

    const contentType = matches[1];
    const base64 = matches[2];
    const buffer = Buffer.from(base64, 'base64');

    return this.uploadImage(buffer, filename, contentType);
  }

  /**
   * Delete an image from Vercel Blob storage
   */
  async deleteImage(pathname: string): Promise<void> {
    if (!this.blobToken) {
      console.warn('Blob storage not configured, skipping delete');
      return;
    }

    try {
      // Use Vercel Blob delete API
      if (BlobClient && BlobClient.del) {
        await BlobClient.del(pathname, { token: this.blobToken });
        return;
      }

      // Fallback: use direct HTTP delete
      const response = await fetch(`${this.blobUrl}/${pathname}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.blobToken}`,
        },
      });

      if (!response.ok) {
        console.error('Delete failed:', await response.text());
      }
    } catch (error) {
      console.error('Blob delete error:', error);
    }
  }

  /**
   * Get image URL
   */
  getImageUrl(pathname: string): string {
    if (!this.blobToken || pathname.startsWith('/')) {
      return pathname;
    }
    return `${this.blobUrl}/${pathname}`;
  }
}
