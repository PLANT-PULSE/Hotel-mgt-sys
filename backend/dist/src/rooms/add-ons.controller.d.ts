import { PrismaService } from '../prisma/prisma.service';
export declare class AddOnsController {
    private prisma;
    constructor(prisma: PrismaService);
    list(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        key: string;
        price: import("@prisma/client/runtime/library").Decimal;
    }[]>;
}
