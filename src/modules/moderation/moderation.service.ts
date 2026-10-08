import { prisma } from '../../database/prisma';
import { AppError, NotFoundError } from '../../shared/errors/app-error';
import { CreateReportDTO } from './moderation.dto';

export class ModerationService {
  /** Registra uma denúncia de um usuário contra outro. */
  async createReport(reporterId: string, dto: CreateReportDTO) {
    if (dto.reportedUserId === reporterId) {
      throw new AppError('Você não pode denunciar a si mesmo', 400, 'INVALID_TARGET');
    }
    const exists = await prisma.user.count({ where: { id: dto.reportedUserId } });
    if (!exists) throw new NotFoundError('Usuário não encontrado');

    return prisma.report.create({
      data: {
        reporterId,
        reportedId: dto.reportedUserId,
        reason: dto.reason,
        details: dto.details,
        context: dto.context,
      },
    });
  }

  /** Bloqueia um usuário (idempotente). */
  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new AppError('Você não pode bloquear a si mesmo', 400, 'INVALID_TARGET');
    }
    const exists = await prisma.user.count({ where: { id: blockedId } });
    if (!exists) throw new NotFoundError('Usuário não encontrado');

    return prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      update: {},
      create: { blockerId, blockedId },
    });
  }

  /** Desbloqueia um usuário. */
  async unblockUser(blockerId: string, blockedId: string) {
    await prisma.block.deleteMany({ where: { blockerId, blockedId } });
  }

  /** Lista os usuários bloqueados por `blockerId`. */
  async listBlocks(blockerId: string) {
    const blocks = await prisma.block.findMany({
      where: { blockerId },
      orderBy: { createdAt: 'desc' },
      include: {
        blocked: {
          select: {
            id: true,
            athlete: { select: { fullName: true, avatarUrl: true } },
            contractor: { select: { name: true, avatarUrl: true } },
          },
        },
      },
    });
    return blocks.map((b) => ({
      userId: b.blockedId,
      name: b.blocked.athlete?.fullName ?? b.blocked.contractor?.name ?? 'Usuário',
      avatarUrl: b.blocked.athlete?.avatarUrl ?? b.blocked.contractor?.avatarUrl ?? null,
      createdAt: b.createdAt,
    }));
  }
}

/** IDs de usuários que `userId` bloqueou OU que bloquearam `userId`. */
export async function blockedUserIds(userId: string): Promise<string[]> {
  const rows = await prisma.block.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });
  const ids = new Set<string>();
  for (const r of rows) ids.add(r.blockerId === userId ? r.blockedId : r.blockerId);
  return [...ids];
}

/** True se A bloqueou B ou B bloqueou A. */
export async function isBlockedBetween(a: string, b: string): Promise<boolean> {
  const count = await prisma.block.count({
    where: {
      OR: [
        { blockerId: a, blockedId: b },
        { blockerId: b, blockedId: a },
      ],
    },
  });
  return count > 0;
}
