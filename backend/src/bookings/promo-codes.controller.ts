import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('promo-codes')
@Controller('promo-codes')
export class PromoCodesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List active promo codes (public)' })
  async list() {
    const now = new Date();
    return this.prisma.promoCode.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validTo: { gte: now },
      },
    });
  }

  @Post('validate')
  @Public()
  @ApiOperation({ summary: 'Validate promo code' })
  async validate(@Body() body: { code: string }) {
    const promo = await this.prisma.promoCode.findFirst({
      where: {
        code: body.code?.toUpperCase(),
        isActive: true,
        validFrom: { lte: new Date() },
        validTo: { gte: new Date() },
      },
    });
    if (!promo) return { valid: false, discount: 0 };
    return {
      valid: true,
      discount: Number(promo.discount),
      description: promo.description,
    };
  }
}
