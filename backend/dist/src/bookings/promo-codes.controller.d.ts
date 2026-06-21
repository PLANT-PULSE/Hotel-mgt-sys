import { PrismaService } from '../prisma/prisma.service';
export declare class PromoCodesController {
    private prisma;
    constructor(prisma: PrismaService);
    list(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        businessId: string;
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discount: import("@prisma/client/runtime/library").Decimal;
        validFrom: Date;
        validTo: Date;
        maxUses: number | null;
        usedCount: number;
    }[]>;
    validate(body: {
        code: string;
    }): Promise<{
        valid: boolean;
        discount: number;
        description?: undefined;
    } | {
        valid: boolean;
        discount: number;
        description: string | null;
    }>;
}
