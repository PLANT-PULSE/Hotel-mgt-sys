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
exports.BlobStorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let BlobClient;
try {
    const blobModule = require('@vercel/blob');
    BlobClient = blobModule;
}
catch (e) {
    console.warn('@vercel/blob not available, using fallback');
}
let BlobStorageService = class BlobStorageService {
    constructor(configService) {
        this.configService = configService;
        this.blobToken = this.configService.get('BLOB_READ_WRITE_TOKEN') || '';
        this.bucketName = this.configService.get('BLOB_BUCKET_NAME') || 'hotel-images';
        this.blobUrl = `https://public.blob.vercel-storage.com`;
    }
    async uploadImage(file, filename, contentType) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(contentType)) {
            throw new common_1.BadRequestException('Invalid image format. Allowed: JPEG, PNG, WebP, GIF');
        }
        if (file.length > 5 * 1024 * 1024) {
            throw new common_1.BadRequestException('File size too large. Maximum 5MB allowed');
        }
        if (!this.blobToken) {
            const placeholderUrl = `/placeholder.jpg`;
            return { url: placeholderUrl, pathname: filename };
        }
        const timestamp = Date.now();
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `rooms/${timestamp}-${sanitizedFilename}`;
        try {
            if (BlobClient && BlobClient.put) {
                const blob = await BlobClient.put(path, file, {
                    contentType,
                    access: 'public',
                    token: this.blobToken,
                });
                return { url: blob.url, pathname: blob.pathname };
            }
            const response = await fetch(`${this.blobUrl}/${this.bucketName}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.blobToken}`,
                    'Content-Type': contentType,
                    'x-blob-path': path,
                },
                body: new Uint8Array(file),
            });
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Upload failed: ${error}`);
            }
            const result = await response.json();
            return { url: result.url, pathname: result.pathname };
        }
        catch (error) {
            console.error('Blob upload error:', error);
            return { url: '/placeholder.jpg', pathname: path };
        }
    }
    async uploadFromBase64(base64Data, filename) {
        const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
            throw new common_1.BadRequestException('Invalid base64 data format');
        }
        const contentType = matches[1];
        const base64 = matches[2];
        const buffer = Buffer.from(base64, 'base64');
        return this.uploadImage(buffer, filename, contentType);
    }
    async deleteImage(pathname) {
        if (!this.blobToken) {
            console.warn('Blob storage not configured, skipping delete');
            return;
        }
        try {
            if (BlobClient && BlobClient.del) {
                await BlobClient.del(pathname, { token: this.blobToken });
                return;
            }
            const response = await fetch(`${this.blobUrl}/${pathname}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.blobToken}`,
                },
            });
            if (!response.ok) {
                console.error('Delete failed:', await response.text());
            }
        }
        catch (error) {
            console.error('Blob delete error:', error);
        }
    }
    getImageUrl(pathname) {
        if (!this.blobToken || pathname.startsWith('/')) {
            return pathname;
        }
        return `${this.blobUrl}/${pathname}`;
    }
};
exports.BlobStorageService = BlobStorageService;
exports.BlobStorageService = BlobStorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BlobStorageService);
//# sourceMappingURL=blob-storage.service.js.map