import { prisma } from '../../database/prisma';

export class DashboardRepository {
  async findAthleteByUserId(userId: string) {
    return prisma.athlete.findUnique({
      where: { userId },
      include: {
        user: { select: { emailVerified: true, phoneVerified: true } },
        videos: true,
        seasonStats: { orderBy: { year: 'desc' }, take: 1 },
      },
    });
  }

  async countViewsToday(athleteId: string): Promise<number> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return prisma.profileView.count({ where: { athleteId, viewedAt: { gte: start } } });
  }

  async countViewsThisWeek(athleteId: string): Promise<number> {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return prisma.profileView.count({ where: { athleteId, viewedAt: { gte: since } } });
  }

  async countPendingProposals(athleteId: string): Promise<number> {
    return prisma.proposal.count({ where: { athleteId, status: 'PENDING' } });
  }

  async whoViewedToday(athleteId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return prisma.profileView.findMany({
      where: { athleteId, viewedAt: { gte: start } },
      include: {
        contractor: { select: { id: true, name: true, type: true, companyName: true, avatarUrl: true } },
      },
      orderBy: { viewedAt: 'desc' },
      take: 20,
    });
  }

  async recentClubs(limit = 10) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return prisma.contractor.findMany({
      where: { type: 'CLUB', user: { status: 'ACTIVE', createdAt: { gte: since } } },
      select: {
        id: true,
        name: true,
        companyName: true,
        avatarUrl: true,
        user: { select: { createdAt: true } },
      },
      orderBy: { user: { createdAt: 'desc' } },
      take: limit,
    });
  }

  async latestPendingProposal(athleteId: string) {
    return prisma.proposal.findFirst({
      where: { athleteId, status: 'PENDING' },
      include: {
        contractor: { select: { id: true, name: true, type: true, companyName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async recordView(athleteId: string, contractorId: string) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recent = await prisma.profileView.findFirst({
      where: { athleteId, contractorId, viewedAt: { gte: oneHourAgo } },
    });
    if (recent) return recent;
    return prisma.profileView.create({ data: { athleteId, contractorId } });
  }
}
