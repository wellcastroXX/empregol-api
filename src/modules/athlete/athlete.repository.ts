import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { UpdateAthleteDTO } from './athlete.dto';

export class AthleteRepository {
  async findByUserId(userId: string) {
    return prisma.athlete.findUnique({ where: { userId } });
  }

  /** A vitrine pública é anônima: devolve só o que pode ser exibido a qualquer um. */
  async findPublicBySlug(slug: string) {
    return prisma.athlete.findFirst({
      where: { slug, publicProfile: true, user: { status: 'ACTIVE' } },
      select: {
        id: true,
        slug: true,
        fullName: true,
        // birthDate fica de fora de propósito: a vitrine mostra a idade, não a
        // data exata. CPF, telefone, e-mail e pretensão salarial idem.
        birthDate: true,
        naturalidade: true,
        gender: true,
        position: true,
        positions: true,
        dominantFoot: true,
        height: true,
        weight: true,
        level: true,
        availability: true,
        agencyStatus: true,
        jerseyNumber: true,
        avatarUrl: true,
        sportsProfileUrl: true,
        additionalInfo: true,
        lastClub: true,
        goals: true,
        assists: true,
        gamesThisSeason: true,
        minutesPlayed: true,
        seasonStats: { orderBy: { year: 'desc' } },
        media: {
          where: { isPublic: true },
          orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });
  }

  async isSlugTaken(slug: string) {
    return (await prisma.athlete.count({ where: { slug } })) > 0;
  }

  async setSlug(id: string, slug: string) {
    return prisma.athlete.update({ where: { id }, data: { slug } });
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
        userId: true,
        fullName: true,
        birthDate: true,
        naturalidade: true,
        gender: true,
        position: true,
        positions: true,
        dominantFoot: true,
        height: true,
        weight: true,
        level: true,
        availability: true,
        agencyStatus: true,
        jerseyNumber: true,
        expectedSalary: true,
        avatarUrl: true,
        socialMedia: true,
        sportsProfileUrl: true,
        additionalInfo: true,
        createdAt: true,
        goals: true,
        assists: true,
        gamesThisSeason: true,
        minutesPlayed: true,
        lastClub: true,
        seasonStats: { orderBy: { year: 'desc' } },
        media: {
          where: { isPublic: true },
          orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });
  }

  async listAthletes(params: {
    page: number;
    limit: number;
    position?: string;
    level?: string;
    availability?: string;
    excludeUserIds?: string[];
  }) {
    const { page, limit, position, level, availability, excludeUserIds } = params;
    const where: Prisma.AthleteWhereInput = {
      ...(position && { position: { contains: position, mode: 'insensitive' } }),
      ...(level && { level: level as any }),
      ...(availability && { availability: availability as any }),
      ...(excludeUserIds?.length ? { userId: { notIn: excludeUserIds } } : {}),
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
