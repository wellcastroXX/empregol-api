import { UserRole } from '@prisma/client';
import { ENGAGEMENT_RULES, MESSAGE_BY_ID } from './message-bank';
import { NotificationsRepository } from './notifications.repository';
import { sendExpoPush } from './push.service';
import { hasEmptyVar, inSendWindow, isQuietHour, renderTemplate } from './rules';

/** NOTIF_TEST_MODE=true ignora silêncio/janela/limites (só p/ testes). */
const TEST_MODE = process.env.NOTIF_TEST_MODE === 'true';

type Vars = Record<string, string | number | undefined | null>;
export type DispatchResult = { sent: boolean; reason?: string };

export class NotificationsService {
  private readonly repo = new NotificationsRepository();

  registerDevice(userId: string, token: string, platform?: string) {
    return this.repo.upsertToken(userId, token, platform);
  }

  unregisterDevice(token: string) {
    return this.repo.removeToken(token);
  }

  /** Dispara uma mensagem do banco para um usuário (canal PUSH), com regras. */
  async dispatch(userId: string, messageId: string, vars: Vars = {}): Promise<DispatchResult> {
    const msg = MESSAGE_BY_ID[messageId];
    if (!msg) return { sent: false, reason: 'unknown-message' };
    if (!msg.channels.includes('PUSH')) return { sent: false, reason: 'no-push-channel' };

    const now = new Date();
    if (!TEST_MODE) {
      if (isQuietHour(now)) return { sent: false, reason: 'quiet-hours' };
      if (!inSendWindow(msg.audience, now)) return { sent: false, reason: 'out-of-window' };

      const dayAgo = new Date(now.getTime() - 24 * 3600 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      const [today, week] = await Promise.all([
        this.repo.countPushSince(userId, dayAgo),
        this.repo.countPushSince(userId, weekAgo),
      ]);
      if (today >= ENGAGEMENT_RULES.limits.pushPerDay) return { sent: false, reason: 'daily-limit' };
      if (week >= ENGAGEMENT_RULES.limits.pushPerWeek) return { sent: false, reason: 'weekly-limit' };
    }

    const title = renderTemplate(msg.title, vars);
    const useFallback = !!msg.fallbackBody && hasEmptyVar(msg.body, vars);
    const body = renderTemplate(useFallback ? msg.fallbackBody! : msg.body, vars);
    if (title.skip || body.skip) return { sent: false, reason: 'missing-required-var' };

    const tokens = await this.repo.tokensForUser(userId);
    if (!tokens.length) return { sent: false, reason: 'no-tokens' };

    await sendExpoPush(
      tokens.map((to) => ({
        to,
        title: title.text,
        body: body.text,
        sound: 'default',
        data: { messageId: msg.id, deepLink: msg.deepLink, ...vars },
      })),
    );
    await this.repo.logSent(userId, msg.id, 'PUSH');
    return { sent: true };
  }

  /** Dispara uma mensagem para todos os usuários do público dela (com token). */
  async broadcast(messageId: string, vars: Vars = {}): Promise<{ sent: number; total: number }> {
    const msg = MESSAGE_BY_ID[messageId];
    if (!msg) return { sent: 0, total: 0 };
    const roles: UserRole[] = msg.audience === 'ATHLETE' ? ['ATHLETE'] : ['AGENT', 'CLUB'];
    const ids = await this.repo.userIdsWithTokens(roles);
    let sent = 0;
    for (const id of ids) {
      const r = await this.dispatch(id, messageId, vars);
      if (r.sent) sent++;
    }
    return { sent, total: ids.length };
  }
}

/** Instância única — chamada pelos gatilhos de evento. Nunca lança. */
export const notifications = new NotificationsService();

export function notify(userId: string, messageId: string, vars: Vars = {}): void {
  notifications.dispatch(userId, messageId, vars).catch((err) => {
    console.warn('[notify] falha:', messageId, (err as Error).message);
  });
}
