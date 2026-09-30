import { DashboardService } from '../dashboard/dashboard.service';
import { notify } from './notifications.service';
import { SchedulerRepository } from './scheduler.repository';

const DAY = 24 * 60 * 60 * 1000;
const repo = new SchedulerRepository();
const dashboard = new DashboardService();

const firstName = (full: string) => full.trim().split(/\s+/)[0] || full;
const hasVideo = (media: { mediaType: string }[]) => media.some((m) => m.mediaType === 'VIDEO');
const clubName = (c: { name: string; companyName: string | null }) => c.companyName ?? c.name;

async function completionPct(userId: string): Promise<number> {
  try {
    return (await dashboard.getProfileCompletion(userId)).overall;
  } catch {
    return 100; // sem perfil → não incomoda
  }
}

const createdBetween = (n: number) => ({
  from: new Date(Date.now() - (n + 1) * DAY),
  to: new Date(Date.now() - n * DAY),
});

/* ── Onboarding 1h (a cada hora): AT-02 · CL-02 ── */
export async function jobOnboardingHourly() {
  const to = new Date(Date.now() - 60 * 60 * 1000);
  const from = new Date(Date.now() - 2 * 60 * 60 * 1000);
  for (const a of await repo.athletesCreatedBetween(from, to)) {
    if ((await completionPct(a.userId)) < 50) notify(a.userId, 'AT-02', { nome: firstName(a.fullName) });
  }
  for (const c of await repo.contractorsCreatedBetween(from, to)) {
    if (!c.avatarUrl) notify(c.userId, 'CL-02', { clube: clubName(c) }); // sem escudo = incompleto
  }
}

/* ── Onboarding diário do atleta (janela da manhã): AT-03/04/05 ── */
export async function jobOnboardingAthleteDaily() {
  for (const a of await repo.athletesCreatedBetween(createdBetween(1).from, createdBetween(1).to)) {
    if (!hasVideo(a.media)) notify(a.userId, 'AT-03', { nome: firstName(a.fullName) });
  }
  for (const a of await repo.athletesCreatedBetween(createdBetween(2).from, createdBetween(2).to)) {
    if (!a.avatarUrl) notify(a.userId, 'AT-04', { nome: firstName(a.fullName) });
  }
  for (const a of await repo.athletesCreatedBetween(createdBetween(3).from, createdBetween(3).to)) {
    const pct = await completionPct(a.userId);
    if (pct < 80) notify(a.userId, 'AT-05', { perc: String(pct) });
  }
}

/* ── Inatividade do atleta (janela da manhã): AT-30/31/32/33/34 + AT-35 mensal ── */
export async function jobInactivityAthletes() {
  const map: Record<number, string> = { 3: 'AT-30', 7: 'AT-31', 14: 'AT-32', 30: 'AT-33', 60: 'AT-34' };
  for (const [days, id] of Object.entries(map)) {
    for (const a of await repo.inactiveAthletes(Number(days))) {
      notify(a.userId, id, { nome: firstName(a.fullName) });
    }
  }
  // Depois dos 60 dias: 1 incentivo/mês (AT-35/b/c alternando).
  const variants = ['AT-35', 'AT-35b', 'AT-35c'];
  for (const a of await repo.inactiveAthletesOver60()) {
    const inactiveDays = Math.floor((Date.now() - a.user.lastActiveAt.getTime()) / DAY);
    const sinceCycle = inactiveDays - 60;
    if (sinceCycle > 0 && sinceCycle % 30 === 0) {
      const idx = (sinceCycle / 30 - 1) % variants.length;
      notify(a.userId, variants[idx], { nome: firstName(a.fullName) });
    }
  }
}

/* ── Inatividade do clube (janela da manhã): CL-30/31 (32/33 são e-mail) ── */
export async function jobInactivityContractors() {
  const map: Record<number, string> = { 7: 'CL-30', 14: 'CL-31' };
  for (const [days, id] of Object.entries(map)) {
    for (const c of await repo.inactiveContractors(Number(days))) {
      notify(c.userId, id, { clube: clubName(c) });
    }
  }
}

/* ── Marcos de data (janela da manhã): AT-42 aniversário · AT-43 1 ano ── */
export async function jobDateMilestones() {
  for (const a of await repo.athletesBirthdayToday()) {
    notify(a.userId, 'AT-42', { nome: firstName(a.fullName) });
  }
  for (const a of await repo.athletesSignupAnniversaryToday()) {
    notify(a.userId, 'AT-43', { nome: firstName(a.fullName) });
  }
}

/* ── Conteúdo quinzenal (quinta 19h, alternando AT-20..23) ── */
export async function jobBiweeklyContent() {
  const week = Math.floor(
    (Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 1)) / (7 * DAY),
  );
  if (week % 2 !== 0) return; // só a cada 2 semanas
  const topics = ['AT-20', 'AT-21', 'AT-22', 'AT-23'];
  const id = topics[Math.floor(week / 2) % topics.length];
  for (const a of await repo.athleteUserIdsWithTokens()) {
    notify(a.userId, id);
  }
}
