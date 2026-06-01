import { prisma } from '../../database/prisma';
import { UpsertSeasonStatsDTO } from './season-stats.dto';

export class SeasonStatsRepository {
  async findAthleteByUserId(userId: string) {
    return prisma.athlete.findUnique({ where: { userId } });
  }

  async upsert(athleteId: string, dto: UpsertSeasonStatsDTO) {
    return prisma.seasonStats.upsert({
      where: { athleteId_year: { athleteId, year: dto.year } },
      create: { athleteId, ...dto },
      update: dto,
    });
  }

  async listByAthlete(athleteId: string) {
    return prisma.seasonStats.findMany({
      where: { athleteId },
      orderBy: { year: 'desc' },
    });
  }

  async findByYear(athleteId: string, year: number) {
    return prisma.seasonStats.findUnique({
      where: { athleteId_year: { athleteId, year } },
    });
  }

  // Sync the most recent season into the denormalized Athlete fields
  async syncLatestToAthlete(athleteId: string) {
    const latest = await prisma.seasonStats.findFirst({
      where: { athleteId },
      orderBy: { year: 'desc' },
    });
    if (!latest) return;
    await prisma.athlete.update({
      where: { id: athleteId },
      data: {
        goals:          latest.goals,
        assists:        latest.assists,
        gamesThisSeason: latest.gamesPlayed,
        minutesPlayed:  latest.minutesPlayed,
        lastClub:       latest.lastClub,
      },
    });
  }
}
