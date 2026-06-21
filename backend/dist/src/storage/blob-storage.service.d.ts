import { ConfigService } from '@nestjs/config';
export declare class BlobStorageService {
    private configService;
    private blobToken;
    private bucketName;
    private blobUrl;
    constructor(configService: ConfigService);
    uploadImage(file: Buffer, filename: string, contentType: string): Promise<{
        url: string;
        pathname: string;
    }>;
    private saveLocalImage;
    uploadFromBase64(base64Data: string, filename: string): Promise<{
        url: string;
        pathname: string;
    }>;
    deleteImage(pathname: string): Promise<void>;
    getImageUrl(pathname: string): string;
}
