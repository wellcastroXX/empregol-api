import { prisma } from '../../database/prisma';

export class FavoriteRepository {
  async findContractorByUserId(userId: string) {
    return prisma.contractor.findUnique({ where: { userId } });
  }

  async findAthleteById(id: string) {
    return prisma.athlete.findUnique({ where: { id } });
  }

  async toggle(contractorId: string, athleteId: string): Promise<{ favorited: boolean }> {
    const existing = await prisma.favorite.findUnique({
      where: { contractorId_athleteId: { contractorId, athleteId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await prisma.favorite.create({ data: { contractorId, athleteId } });
    return { favorited: true };
  }

  async list(contractorId: string) {
    return prisma.favorite.findMany({
      where: { contractorId },
      include: {
        athlete: {
          select: {
            id: true,
            fullName: true,
            position: true,
            level: true,
            availability: true,
            agencyStatus: true,
            gender: true,
            height: true,
            birthDate: true,
            avatarUrl: true,
            goals: true,
            assists: true,
            minutesPlayed: true,
            state: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async isFavorited(contractorId: string, athleteId: string): Promise<boolean> {
    const record = await prisma.favorite.findUnique({
      where: { contractorId_athleteId: { contractorId, athleteId } },
    });
    return !!record;
  }
}
