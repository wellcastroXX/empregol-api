import { prisma } from '../../database/prisma';
import { SendMessageDTO } from './message.dto';

export class MessageRepository {
  async findConversationById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        athlete: { select: { id: true, userId: true } },
        contractor: { select: { id: true, userId: true } },
      },
    });
  }

  async create(conversationId: string, senderUserId: string, dto: SendMessageDTO) {
    return prisma.message.create({
      data: {
        conversationId,
        senderUserId,
        type: dto.type,
        content: dto.type === 'TEXT' ? dto.content : null,
        audioUrl: dto.type === 'AUDIO' ? dto.audioUrl : null,
        proposalId: dto.type === 'INVITE_CARD' ? dto.proposalId : null,
      },
    });
  }

  async list(conversationId: string, cursor?: string, limit = 30) {
    return prisma.message.findMany({
      where: { conversationId },
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(conversationId: string, readerUserId: string) {
    return prisma.message.updateMany({
      where: {
        conversationId,
        senderUserId: { not: readerUserId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  }
}
