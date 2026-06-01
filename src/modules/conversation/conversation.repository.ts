import { ContractorType } from '@prisma/client';
import { prisma } from '../../database/prisma';

const CONTRACTOR_SELECT = {
  id: true, userId: true, name: true, type: true, companyName: true, avatarUrl: true,
} as const;

const ATHLETE_SELECT = {
  id: true, userId: true, fullName: true, position: true, avatarUrl: true, jerseyNumber: true,
} as const;

export class ConversationRepository {
  async findAthleteByUserId(userId: string) {
    return prisma.athlete.findUnique({ where: { userId } });
  }

  async findAthleteById(id: string) {
    return prisma.athlete.findUnique({ where: { id } });
  }

  async findContractorByUserId(userId: string) {
    return prisma.contractor.findUnique({ where: { userId } });
  }

  async findOrCreate(athleteId: string, contractorId: string) {
    const existing = await prisma.conversation.findUnique({
      where: { athleteId_contractorId: { athleteId, contractorId } },
    });
    if (existing) return { conversation: existing, created: false };

    const conversation = await prisma.conversation.create({
      data: { athleteId, contractorId },
    });
    return { conversation, created: true };
  }

  async findById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        athlete: { select: ATHLETE_SELECT },
        contractor: { select: CONTRACTOR_SELECT },
      },
    });
  }

  // Conversations for an athlete — supports tab filters
  async listForAthlete(athleteId: string, filter?: { unreadOnly?: boolean; contractorType?: ContractorType }) {
    return prisma.conversation.findMany({
      where: {
        athleteId,
        ...(filter?.unreadOnly ? { athleteUnreadCount: { gt: 0 } } : {}),
        ...(filter?.contractorType ? { contractor: { type: filter.contractorType } } : {}),
      },
      include: {
        contractor: { select: CONTRACTOR_SELECT },
      },
      orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
    });
  }

  // Conversations for a contractor
  async listForContractor(contractorId: string, filter?: { unreadOnly?: boolean }) {
    return prisma.conversation.findMany({
      where: {
        contractorId,
        ...(filter?.unreadOnly ? { contractorUnreadCount: { gt: 0 } } : {}),
      },
      include: {
        athlete: { select: ATHLETE_SELECT },
      },
      orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
    });
  }

  // Mark all messages in this conversation as read from the receiver's perspective
  async markRead(conversationId: string, readerRole: 'ATHLETE' | 'CONTRACTOR') {
    if (readerRole === 'ATHLETE') {
      return prisma.conversation.update({
        where: { id: conversationId },
        data: { athleteUnreadCount: 0 },
      });
    }
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { contractorUnreadCount: 0 },
    });
  }

  async incrementUnread(conversationId: string, recipientRole: 'ATHLETE' | 'CONTRACTOR') {
    if (recipientRole === 'ATHLETE') {
      return prisma.conversation.update({
        where: { id: conversationId },
        data: { athleteUnreadCount: { increment: 1 } },
      });
    }
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { contractorUnreadCount: { increment: 1 } },
    });
  }

  async updateLastMessage(conversationId: string, preview: string) {
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date(), lastMessagePreview: preview.slice(0, 80) },
    });
  }
}
