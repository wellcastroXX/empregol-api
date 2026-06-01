import { UserRole } from '@prisma/client';
import { MessageRepository } from './message.repository';
import { ConversationRepository } from '../conversation/conversation.repository';
import { SendMessageDTO } from './message.dto';
import { NotFoundError, ForbiddenError } from '../../shared/errors/app-error';

export class MessageService {
  private readonly repo = new MessageRepository();
  private readonly convRepo = new ConversationRepository();

  private async resolveParticipant(userId: string, role: UserRole) {
    if (role === 'ATHLETE') return this.convRepo.findAthleteByUserId(userId);
    return this.convRepo.findContractorByUserId(userId);
  }

  private async assertAccess(conversationId: string, userId: string, role: UserRole) {
    const conv = await this.repo.findConversationById(conversationId);
    if (!conv) throw new NotFoundError('Conversa não encontrada');

    if (role === 'ATHLETE' && conv.athlete.userId !== userId) throw new ForbiddenError();
    if ((role === 'AGENT' || role === 'CLUB') && conv.contractor.userId !== userId) throw new ForbiddenError();

    return conv;
  }

  async send(userId: string, role: UserRole, conversationId: string, dto: SendMessageDTO) {
    const conv = await this.assertAccess(conversationId, userId, role);

    const message = await this.repo.create(conversationId, userId, dto);

    const preview = dto.type === 'TEXT' ? dto.content
      : dto.type === 'AUDIO' ? '🎙️ Mensagem de voz'
      : '📋 Convite de teste';

    const recipientRole = role === 'ATHLETE' ? 'CONTRACTOR' : 'ATHLETE';
    await Promise.all([
      this.convRepo.updateLastMessage(conversationId, preview),
      this.convRepo.incrementUnread(conversationId, recipientRole),
    ]);

    return { message, conversationId: conv.id };
  }

  async list(userId: string, role: UserRole, conversationId: string, cursor?: string) {
    await this.assertAccess(conversationId, userId, role);

    const messages = await this.repo.list(conversationId, cursor);

    // Mark messages from the other party as read
    await this.repo.markRead(conversationId, userId);
    const readerRole = role === 'ATHLETE' ? 'ATHLETE' : 'CONTRACTOR';
    await this.convRepo.markRead(conversationId, readerRole);

    return messages;
  }
}
