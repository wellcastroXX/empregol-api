import { prisma } from '../../database/prisma';
import { DashboardRepository } from './dashboard.repository';
import { NotFoundError } from '../../shared/errors/app-error';
import { notify } from '../notifications/notifications.service';

// Sections used for profile completion calculation
const SECTIONS = {
  personalData: {
    label: 'Dados pessoais',
    total: 6,
    fields: (a: any) => [a.fullName, a.cpf, a.birthDate, a.naturalidade, a.phone, a.user?.emailVerified],
  },
  physicalProfile: {
    label: 'Posição & físico',
    total: 5,
    fields: (a: any) => [a.position, a.dominantFoot, a.height, a.weight, a.level],
  },
  videos: {
    label: 'Vídeos & jogadas',
    total: 3,
    fields: (a: any) => (a.videos ?? []).slice(0, 3).map(() => true),
  },
  seasonStats: {
    label: 'Estatísticas',
    total: 6,
    fields: (a: any) => {
      const s = a.seasonStats?.[0];
      if (!s) return [];
      return [s.goals >= 0, s.assists >= 0, s.gamesPlayed >= 0, s.minutesPlayed >= 0, s.position, s.lastClub];
    },
  },
  salary: {
    label: 'Pretensão salarial',
    total: 1,
    fields: (a: any) => [a.expectedSalary],
  },
} as const;

function computeCompletion(athlete: any) {
  const sectionResults = Object.entries(SECTIONS).map(([key, section]) => {
    const filled = section.fields(athlete).filter(Boolean).length;
    const pct = Math.round((filled / section.total) * 100);
    return { key, label: section.label, filled, total: section.total, complete: filled === section.total, pct };
  });

  const totalFields = sectionResults.reduce((s, r) => s + r.total, 0);
  const filledFields = sectionResults.reduce((s, r) => s + r.filled, 0);
  const overall = Math.round((filledFields / totalFields) * 100);

  return { overall, sections: sectionResults };
}

export class DashboardService {
  private readonly repo = new DashboardRepository();

  async getAthleteDashboard(userId: string) {
    const athlete = await this.repo.findAthleteByUserId(userId);
    if (!athlete) throw new NotFoundError('Perfil de atleta não encontrado');

    const daysOnPlatform = Math.floor(
      (Date.now() - athlete.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    const [viewsToday, viewsThisWeek, pendingProposals, whoViewedToday, recentClubs, latestProposal] =
      await Promise.all([
        this.repo.countViewsToday(athlete.id),
        this.repo.countViewsThisWeek(athlete.id),
        this.repo.countPendingProposals(athlete.id),
        this.repo.whoViewedToday(athlete.id),
        this.repo.recentClubs(10),
        this.repo.latestPendingProposal(athlete.id),
      ]);

    return {
      stats: { viewsToday, viewsThisWeek, pendingProposals, daysOnPlatform },
      latestProposal,
      recentClubs,
      whoViewedToday,
    };
  }

  async getProfileCompletion(userId: string) {
    const athlete = await this.repo.findAthleteByUserId(userId);
    if (!athlete) throw new NotFoundError('Perfil de atleta não encontrado');
    return computeCompletion(athlete);
  }

  async recordProfileView(athleteId: string, contractorUserId: string) {
    const contractor = await prisma.contractor.findUnique({ where: { userId: contractorUserId } });
    if (!contractor) return;
    const { created } = await this.repo.recordView(athleteId, contractor.id);
    if (created) this.notifyView(athleteId).catch(() => undefined);
  }

  /** Push ao atleta: 1ª view (AT-40), marcos (AT-41, in-app) ou visualização (AT-10). */
  private async notifyView(athleteId: string) {
    const athlete = await prisma.athlete.findUnique({
      where: { id: athleteId },
      select: { userId: true },
    });
    if (!athlete) return;
    const total = await this.repo.countViews(athleteId);
    if (total === 1) return notify(athlete.userId, 'AT-40');
    if ([10, 50, 100].includes(total)) return notify(athlete.userId, 'AT-41', { n: total });
    // Sem série/nome autorizado → usa o fallback "Um clube viu seu perfil hoje".
    notify(athlete.userId, 'AT-10', { serie: '' });
  }
}
