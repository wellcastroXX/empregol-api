import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { UpdateAthleteDTO } from './athlete.dto';

export class AthleteRepository {
  async findByUserId(userId: string) {
    return prisma.athlete.findUnique({ where: { userId } });
  }

  async findById(id: string) {
    return prisma.athlete.findUnique({
      where: { id },
      include: { user: { select: { email: true, status: true, emailVerified: true } } },
    });
  }

  async findBasicById(id: string) {
    return prisma.athlete.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        position: true,
        dominantFoot: true,
        level: true,
        availability: true,
        agencyStatus: true,
        expectedSalary: true,
        avatarUrl: true,
        goals: true,
        assists: true,
        gamesThisSeason: true,
        lastClub: true,
      },
    });
  }

  async listAthletes(params: {
    page: number;
    limit: number;
    position?: string;
    level?: string;
    availability?: string;
  }) {
    const { page, limit, position, level, availability } = params;
    const where: Prisma.AthleteWhereInput = {
      ...(position && { position: { contains: position, mode: 'insensitive' } }),
      ...(level && { level: level as any }),
      ...(availability && { availability: availability as any }),
      user: { status: 'ACTIVE' },
    };

    const [athletes, total] = await Promise.all([
      prisma.athlete.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          fullName: true,
          position: true,
          dominantFoot: true,
          level: true,
          availability: true,
          agencyStatus: true,
          expectedSalary: true,
          avatarUrl: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.athlete.count({ where }),
    ]);

    return { athletes, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async update(userId: string, data: UpdateAthleteDTO) {
    return prisma.athlete.update({ where: { userId }, data });
  }
}
