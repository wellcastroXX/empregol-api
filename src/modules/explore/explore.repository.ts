import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ExploreQueryDTO, ContractorQueryDTO } from './explore.dto';

const CARD_SELECT = {
  id: true,
  fullName: true,
  position: true,
  dominantFoot: true,
  level: true,
  availability: true,
  agencyStatus: true,
  gender: true,
  height: true,
  weight: true,
  birthDate: true,
  avatarUrl: true,
  jerseyNumber: true,
  state: true,
  city: true,
  lastClub: true,
  goals: true,
  assists: true,
  gamesThisSeason: true,
  minutesPlayed: true,
  expectedSalary: true,
  seasonStats: {
    orderBy: { year: 'desc' as const },
    take: 1,
  },
  createdAt: true,
} as const;

export class ExploreRepository {
  async findContractorByUserId(userId: string) {
    return prisma.contractor.findUnique({ where: { userId } });
  }

  /** "Mercado" — lista clubes/agentes ativos da plataforma. */
  async searchContractors(dto: ContractorQueryDTO) {
    const where: Prisma.ContractorWhereInput = {
      user: { status: 'ACTIVE' },
      ...(dto.type ? { type: dto.type } : {}),
      ...(dto.q
        ? {
            OR: [
              { name: { contains: dto.q, mode: 'insensitive' } },
              { companyName: { contains: dto.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const skip = (dto.page - 1) * dto.limit;

    const [contractors, total] = await Promise.all([
      prisma.contractor.findMany({
        where,
        select: { id: true, name: true, type: true, companyName: true, avatarUrl: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: dto.limit,
      }),
      prisma.contractor.count({ where }),
    ]);

    return {
      contractors,
      total,
      page: dto.page,
      limit: dto.limit,
      totalPages: Math.ceil(total / dto.limit),
    };
  }

  async search(dto: ExploreQueryDTO, contractorId?: string) {
    const where = buildWhere(dto);

    const orderBy = buildOrderBy(dto.orderBy, dto.orderDir);
    const skip = (dto.page - 1) * dto.limit;

    const [athletes, total] = await Promise.all([
      prisma.athlete.findMany({
        where,
        select: {
          ...CARD_SELECT,
          ...(contractorId
            ? { favoritedBy: { where: { contractorId }, select: { id: true } } }
            : {}),
        },
        orderBy,
        skip,
        take: dto.limit,
      }),
      prisma.athlete.count({ where }),
    ]);

    return {
      athletes: athletes.map(enrichAthlete),
      total,
      page: dto.page,
      limit: dto.limit,
      totalPages: Math.ceil(total / dto.limit),
    };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildWhere(dto: ExploreQueryDTO): Prisma.AthleteWhereInput {
  const now = new Date();
  const where: Prisma.AthleteWhereInput = {
    user: { status: 'ACTIVE' },
  };

  if (dto.q) {
    where.fullName = { contains: dto.q, mode: 'insensitive' };
  }

  if (dto.positions?.length) {
    where.position = { in: dto.positions };
  }

  if (dto.availability) where.availability = dto.availability;
  if (dto.agencyStatus) where.agencyStatus = dto.agencyStatus;
  if (dto.level)        where.level = dto.level;
  if (dto.dominantFoot) where.dominantFoot = dto.dominantFoot;
  if (dto.gender)       where.gender = dto.gender;
  if (dto.state)        where.state = { equals: dto.state, mode: 'insensitive' };

  // Age → birthDate range
  if (dto.ageMin || dto.ageMax) {
    where.birthDate = {};
    if (dto.ageMin) {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - dto.ageMin);
      where.birthDate.lte = d;
    }
    if (dto.ageMax) {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - dto.ageMax - 1);
      where.birthDate.gte = d;
    }
  }

  // Height (stored in meters)
  if (dto.heightMin || dto.heightMax) {
    where.height = {
      ...(dto.heightMin ? { gte: dto.heightMin } : {}),
      ...(dto.heightMax ? { lte: dto.heightMax } : {}),
    };
  }

  if (dto.weightMin || dto.weightMax) {
    where.weight = {
      ...(dto.weightMin ? { gte: dto.weightMin } : {}),
      ...(dto.weightMax ? { lte: dto.weightMax } : {}),
    };
  }

  if (dto.salaryMin || dto.salaryMax) {
    where.expectedSalary = {
      ...(dto.salaryMin ? { gte: dto.salaryMin } : {}),
      ...(dto.salaryMax ? { lte: dto.salaryMax } : {}),
    };
  }

  if (dto.goalsMin !== undefined)         where.goals         = { gte: dto.goalsMin };
  if (dto.assistsMin !== undefined)       where.assists       = { gte: dto.assistsMin };
  if (dto.minutesPlayedMin !== undefined) where.minutesPlayed = { gte: dto.minutesPlayedMin };

  return where;
}

function buildOrderBy(field: string, dir: 'asc' | 'desc'): Prisma.AthleteOrderByWithRelationInput {
  const map: Record<string, Prisma.AthleteOrderByWithRelationInput> = {
    createdAt:      { createdAt: dir },
    fullName:       { fullName: dir },
    goals:          { goals: dir },
    assists:        { assists: dir },
    minutesPlayed:  { minutesPlayed: dir },
    height:         { height: dir },
    weight:         { weight: dir },
    expectedSalary: { expectedSalary: dir },
  };
  return map[field] ?? { createdAt: 'desc' };
}

function enrichAthlete(athlete: any) {
  const age = athlete.birthDate
    ? Math.floor((Date.now() - new Date(athlete.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const isFavorited = Array.isArray(athlete.favoritedBy) && athlete.favoritedBy.length > 0;

  const { birthDate, favoritedBy, ...rest } = athlete;
  return { ...rest, age, isFavorited };
}
