import { prisma } from '../../database/prisma';
import type { Channel } from './message-bank';

export class NotificationsRepository {
  /** Regista/atualiza um token de device do usuário (token é único). */
  async upsertToken(userId: string, token: string, platform?: string) {
    return prisma.deviceToken.upsert({
      where: { token },
      update: { userId, platform },
      create: { userId, token, platform },
    });
  }

  async removeToken(token: string) {
    return prisma.deviceToken.deleteMany({ where: { token } });
  }

  async tokensForUser(userId: string): Promise<string[]> {
    const rows = await prisma.deviceToken.findMany({ where: { userId }, select: { token: true } });
    return rows.map((r) => r.token);
  }

  async logSent(userId: string, messageId: string, channel: Channel) {
    return prisma.notificationLog.create({ data: { userId, messageId, channel } });
  }

  /** Contagem de pushes enviados desde `since`. */
  async countPushSince(userId: string, since: Date): Promise<number> {
    return prisma.notificationLog.count({
      where: { userId, channel: 'PUSH', sentAt: { gte: since } },
    });
  }

  async countEmailSince(userId: string, since: Date): Promise<number> {
    return prisma.notificationLog.count({
      where: { userId, channel: 'EMAIL', sentAt: { gte: since } },
    });
  }

  /** Último envio de uma mensagem específica (p/ sequência/dedup). */
  async lastSentAt(userId: string, messageId: string): Promise<Date | null> {
    const row = await prisma.notificationLog.findFirst({
      where: { userId, messageId },
      orderBy: { sentAt: 'desc' },
      select: { sentAt: true },
    });
    return row?.sentAt ?? null;
  }
}
