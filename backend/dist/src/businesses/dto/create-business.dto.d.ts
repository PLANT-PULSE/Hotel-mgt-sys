import { BusinessType } from '@prisma/client';
export declare class CreateBusinessDto {
    name: string;
    slug: string;
    type: BusinessType;
    description?: string;
    email?: string;
    phone?: string;
    city?: string;
    country?: string;
}
