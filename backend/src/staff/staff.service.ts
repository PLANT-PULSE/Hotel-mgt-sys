import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [staff, total] = await Promise.all([
      this.prisma.staff.findMany({
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        skip,
        take: limit,
      }),
      this.prisma.staff.count(),
    ]);
    return { data: staff, meta: { page, limit, total } };
  }

  async findById(id: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }
}
