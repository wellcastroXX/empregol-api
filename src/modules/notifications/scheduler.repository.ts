import { prisma } from '../../database/prisma';

const DAY = 24 * 60 * 60 * 1000;
const activeUser = { user: { is: { status: 'ACTIVE' as const } } };

/** Janela p/ "exatamente N dias inativo": lastActiveAt em (now-(N+1)d, now-N d]. */
function inactiveWindow(days: number) {
  const now = Date.now();
  return { gt: new Date(now - (days + 1) * DAY), lte: new Date(now - days * DAY) };
}

export class SchedulerRepository {
  // ── Onboarding (criados em janela de tempo) ──
  async athletesCreatedBetween(from: Date, to: Date) {
    return prisma.athlete.findMany({
      where: { createdAt: { gte: from, lt: to }, ...activeUser },
      select: {
        id: true,
        userId: true,
        fullName: true,
        position: true,
        avatarUrl: true,
        media: { select: { mediaType: true } },
      },
    });
  }

  async contractorsCreatedBetween(from: Date, to: Date) {
    return prisma.contractor.findMany({
      where: { createdAt: { gte: from, lt: to }, ...activeUser },
      select: { id: true, userId: true, name: true, companyName: true, avatarUrl: true },
    });
  }

  // ── Inatividade (exatamente N dias) ──
  async inactiveAthletes(days: number) {
    return prisma.athlete.findMany({
      where: { user: { is: { status: 'ACTIVE', lastActiveAt: inactiveWindow(days) } } },
      select: { userId: true, fullName: true, position: true },
    });
  }

  async inactiveContractors(days: number) {
    return prisma.contractor.findMany({
      where: { user: { is: { status: 'ACTIVE', lastActiveAt: inactiveWindow(days) } } },
      select: { userId: true, name: true, companyName: true },
    });
  }

  /** Atletas com > 60 dias inativos (p/ o incentivo mensal AT-35). */
  async inactiveAthletesOver60() {
    const cutoff = new Date(Date.now() - 61 * DAY);
    return prisma.athlete.findMany({
      where: { user: { is: { status: 'ACTIVE', lastActiveAt: { lt: cutoff } } } },
      select: { userId: true, fullName: true, position: true, user: { select: { lastActiveAt: true } } },
    });
  }

  // ── Marcos de data ──
  async athletesBirthdayToday(): Promise<{ userId: string; fullName: string }[]> {
    return prisma.$queryRaw`
      SELECT "userId", "fullName" FROM "athletes" a
      JOIN "users" u ON u.id = a."userId"
      WHERE u.status = 'ACTIVE'
        AND EXTRACT(MONTH FROM a."birthDate") = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(DAY   FROM a."birthDate") = EXTRACT(DAY   FROM CURRENT_DATE)`;
  }

  async athletesSignupAnniversaryToday(): Promise<{ userId: string; fullName: string }[]> {
    return prisma.$queryRaw`
      SELECT a."userId", a."fullName" FROM "athletes" a
      JOIN "users" u ON u.id = a."userId"
      WHERE u.status = 'ACTIVE'
        AND EXTRACT(MONTH FROM u."createdAt") = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(DAY   FROM u."createdAt") = EXTRACT(DAY   FROM CURRENT_DATE)
        AND u."createdAt" < date_trunc('year', CURRENT_DATE)`;
  }

  // ── Broadcast (conteúdo quinzenal) ──
  async athleteUserIdsWithTokens(): Promise<{ userId: string; position: string }[]> {
    const rows = await prisma.athlete.findMany({
      where: { user: { is: { status: 'ACTIVE', deviceTokens: { some: {} } } } },
      select: { userId: true, position: true },
    });
    return rows;
  }

  async viewsLast7d(athleteId: string): Promise<number> {
    return prisma.profileView.count({
      where: { athleteId, viewedAt: { gte: new Date(Date.now() - 7 * DAY) } },
    });
  }
}
