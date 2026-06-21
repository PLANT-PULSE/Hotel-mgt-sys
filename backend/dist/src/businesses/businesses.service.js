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
exports.BusinessesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const activity_log_service_1 = require("../common/services/activity-log.service");
let BusinessesService = class BusinessesService {
    constructor(prisma, activityLog) {
        this.prisma = prisma;
        this.activityLog = activityLog;
    }
    async create(dto, ownerId) {
        const existing = await this.prisma.business.findUnique({ where: { slug: dto.slug } });
        if (existing)
            throw new common_1.ConflictException('Business slug already taken');
        const business = await this.prisma.$transaction(async (tx) => {
            const created = await tx.business.create({
                data: {
                    ...dto,
                    ownerId,
                    status: client_1.BusinessStatus.PENDING,
                    subdomain: dto.slug,
                },
            });
            await tx.businessMember.create({
                data: { businessId: created.id, userId: ownerId, role: client_1.UserRole.BUSINESS_OWNER },
            });
            const now = new Date();
            const trialEnd = new Date(now);
            trialEnd.setDate(trialEnd.getDate() + 14);
            await tx.subscription.create({
                data: {
                    businessId: created.id,
                    plan: client_1.SubscriptionPlan.BASIC,
                    status: client_1.SubscriptionStatus.TRIALING,
                    billingCycle: client_1.BillingCycle.MONTHLY,
                    amount: 0,
                    currentPeriodStart: now,
                    currentPeriodEnd: trialEnd,
                },
            });
            return created;
        });
        await this.activityLog.log({
            userId: ownerId,
            action: 'BUSINESS_CREATED',
            entity: 'Business',
            entityId: business.id,
        });
        return business;
    }
    async findBySlug(slug) {
        const business = await this.prisma.business.findUnique({
            where: { slug, deletedAt: null },
            include: {
                subscriptions: { where: { status: { in: [client_1.SubscriptionStatus.ACTIVE, client_1.SubscriptionStatus.TRIALING] } }, take: 1 },
                _count: { select: { roomTypes: true, bookings: true, reviews: true } },
            },
        });
        if (!business || business.status === client_1.BusinessStatus.DELETED) {
            throw new common_1.NotFoundException('Business not found');
        }
        return business;
    }
    async findAll(options) {
        const page = options.page ?? 1;
        const limit = Math.min(options.limit ?? 20, 100);
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
            ...(options.status && { status: options.status }),
        };
        const [data, total] = await Promise.all([
            this.prisma.business.findMany({
                where,
                include: {
                    owner: { select: { id: true, email: true, firstName: true, lastName: true } },
                    subscriptions: { take: 1, orderBy: { createdAt: 'desc' } },
                    _count: { select: { bookings: true, members: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.business.count({ where }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async suspend(id, reason, adminId) {
        const business = await this.prisma.business.update({
            where: { id },
            data: { status: client_1.BusinessStatus.SUSPENDED, suspendedAt: new Date(), suspendedReason: reason },
        });
        await this.activityLog.log({
            userId: adminId,
            role: client_1.UserRole.SUPER_ADMIN,
            action: 'BUSINESS_SUSPENDED',
            entity: 'Business',
            entityId: id,
            metadata: { reason },
        });
        return business;
    }
    async restore(id, adminId) {
        const business = await this.prisma.business.update({
            where: { id },
            data: { status: client_1.BusinessStatus.ACTIVE, suspendedAt: null, suspendedReason: null },
        });
        await this.activityLog.log({
            userId: adminId,
            role: client_1.UserRole.SUPER_ADMIN,
            action: 'BUSINESS_RESTORED',
            entity: 'Business',
            entityId: id,
        });
        return business;
    }
    async softDelete(id, adminId) {
        const business = await this.prisma.business.update({
            where: { id },
            data: { status: client_1.BusinessStatus.DELETED, deletedAt: new Date() },
        });
        await this.activityLog.log({
            userId: adminId,
            role: client_1.UserRole.SUPER_ADMIN,
            action: 'BUSINESS_DELETED',
            entity: 'Business',
            entityId: id,
        });
        return business;
    }
    async updateTheme(id, data) {
        return this.prisma.business.update({ where: { id }, data });
    }
    async search(query) {
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 20, 50);
        const skip = (page - 1) * limit;
        const where = {
            status: client_1.BusinessStatus.ACTIVE,
            deletedAt: null,
        };
        if (query.q) {
            where.OR = [
                { name: { contains: query.q, mode: 'insensitive' } },
                { city: { contains: query.q, mode: 'insensitive' } },
                { country: { contains: query.q, mode: 'insensitive' } },
            ];
        }
        if (query.city)
            where.city = { contains: query.city, mode: 'insensitive' };
        if (query.type)
            where.type = query.type;
        const businesses = await this.prisma.business.findMany({
            where,
            include: {
                roomTypes: {
                    where: { isActive: true },
                    select: { basePrice: true, amenities: true },
                },
                reviews: { where: { status: 'APPROVED' }, select: { rating: true } },
                _count: { select: { bookings: true } },
            },
            skip,
            take: limit,
        });
        let results = businesses.map((b) => {
            const prices = b.roomTypes.map((r) => Number(r.basePrice));
            const minPrice = prices.length ? Math.min(...prices) : 0;
            const avgRating = b.reviews.length > 0
                ? b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length
                : 0;
            const allAmenities = [...new Set(b.roomTypes.flatMap((r) => r.amenities))];
            return {
                id: b.id,
                name: b.name,
                slug: b.slug,
                type: b.type,
                city: b.city,
                country: b.country,
                logo: b.logo,
                coverImage: b.coverImage,
                minPrice,
                avgRating: Math.round(avgRating * 10) / 10,
                reviewCount: b.reviews.length,
                bookingCount: b._count.bookings,
                amenities: allAmenities,
            };
        });
        if (query.minPrice)
            results = results.filter((r) => r.minPrice >= query.minPrice);
        if (query.maxPrice)
            results = results.filter((r) => r.minPrice <= query.maxPrice);
        if (query.minRating)
            results = results.filter((r) => r.avgRating >= query.minRating);
        if (query.amenities?.length) {
            results = results.filter((r) => query.amenities.every((a) => r.amenities.includes(a)));
        }
        if (query.sort === 'price_asc')
            results.sort((a, b) => a.minPrice - b.minPrice);
        else if (query.sort === 'price_desc')
            results.sort((a, b) => b.minPrice - a.minPrice);
        else if (query.sort === 'rating')
            results.sort((a, b) => b.avgRating - a.avgRating);
        else if (query.sort === 'popular')
            results.sort((a, b) => b.bookingCount - a.bookingCount);
        return { data: results, meta: { page, limit } };
    }
    async getPlatformStats() {
        const [totalBusinesses, activeBusinesses, suspendedBusinesses, totalBookings, totalCustomers, totalSubscriptions, revenueAgg, monthlyRevenueAgg,] = await Promise.all([
            this.prisma.business.count({ where: { deletedAt: null } }),
            this.prisma.business.count({ where: { status: client_1.BusinessStatus.ACTIVE, deletedAt: null } }),
            this.prisma.business.count({ where: { status: client_1.BusinessStatus.SUSPENDED } }),
            this.prisma.booking.count(),
            this.prisma.user.count({ where: { role: { in: [client_1.UserRole.CUSTOMER, client_1.UserRole.GUEST] } } }),
            this.prisma.subscription.count({ where: { status: client_1.SubscriptionStatus.ACTIVE } }),
            this.prisma.payment.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: {
                    status: 'COMPLETED',
                    paidAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
                },
                _sum: { amount: true },
            }),
        ]);
        return {
            totalBusinesses,
            activeBusinesses,
            suspendedBusinesses,
            totalBookings,
            totalCustomers,
            totalSubscriptions,
            totalRevenue: Number(revenueAgg._sum.amount ?? 0),
            monthlyRevenue: Number(monthlyRevenueAgg._sum.amount ?? 0),
        };
    }
    async assertMemberAccess(businessId, userId, roles) {
        const member = await this.prisma.businessMember.findUnique({
            where: { businessId_userId: { businessId, userId } },
        });
        if (!member || !member.isActive)
            throw new common_1.ForbiddenException('Access denied');
        if (roles && !roles.includes(member.role))
            throw new common_1.ForbiddenException('Insufficient permissions');
        return member;
    }
};
exports.BusinessesService = BusinessesService;
exports.BusinessesService = BusinessesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        activity_log_service_1.ActivityLogService])
], BusinessesService);
//# sourceMappingURL=businesses.service.js.map