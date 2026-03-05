import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('add-ons')
@Controller('add-ons')
export class AddOnsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List add-ons (public)' })
  async list() {
    return this.prisma.addOn.findMany({
      where: { isActive: true },
    });
  }
}
