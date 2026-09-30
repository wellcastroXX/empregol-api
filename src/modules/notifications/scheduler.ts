import cron from 'node-cron';
import * as jobs from './jobs';

const opts = { timezone: 'America/Sao_Paulo' } as const;

function run(name: string, fn: () => Promise<void>) {
  return () => {
    fn().catch((err) => console.warn(`[scheduler] ${name} falhou:`, (err as Error).message));
  };
}

/**
 * Inicia o agendador de notificações (Fase 2). Horários dentro das janelas de
 * envio (atleta manhã 11h, clube manhã 9h, conteúdo quinta 19h) para as regras
 * de janela não barrarem. ENABLE_SCHEDULER=false desliga.
 */
export function startScheduler(): void {
  if (process.env.ENABLE_SCHEDULER === 'false') {
    console.log('⏸  Scheduler desativado (ENABLE_SCHEDULER=false)');
    return;
  }

  // Onboarding de 1h — toda hora
  cron.schedule('5 * * * *', run('onboarding-hourly', jobs.jobOnboardingHourly), opts);

  // Manhã do atleta (11h BRT): onboarding diário + inatividade + marcos de data
  cron.schedule(
    '0 11 * * *',
    run('athlete-morning', async () => {
      await jobs.jobOnboardingAthleteDaily();
      await jobs.jobInactivityAthletes();
      await jobs.jobDateMilestones();
    }),
    opts,
  );

  // Manhã do clube (9h BRT): inatividade
  cron.schedule('0 9 * * *', run('club-morning', jobs.jobInactivityContractors), opts);

  // Conteúdo quinzenal — quinta-feira 19h BRT
  cron.schedule('0 19 * * 4', run('biweekly-content', jobs.jobBiweeklyContent), opts);

  console.log('🗓  Scheduler de notificações ativo (America/Sao_Paulo)');
}
