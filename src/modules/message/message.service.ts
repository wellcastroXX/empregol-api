import { UserRole } from '@prisma/client';
import { MessageRepository } from './message.repository';
import { ConversationRepository } from '../conversation/conversation.repository';
import { SendMessageDTO } from './message.dto';
import { NotFoundError, ForbiddenError } from '../../shared/errors/app-error';
import { notify } from '../notifications/notifications.service';

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

    // Push para o destinatário (AT-12 atleta · CL-11 clube). Fire-and-forget.
    this.notifyRecipient(conversationId, role).catch(() => undefined);

    return { message, conversationId: conv.id };
  }

  /** Notifica por push quem recebeu a mensagem (usa os nomes da conversa). */
  private async notifyRecipient(conversationId: string, senderRole: UserRole) {
    const full = await this.convRepo.findById(conversationId);
    if (!full) return;
    if (senderRole === 'ATHLETE') {
      notify(full.contractor.userId, 'CL-11', { atleta: full.athlete.fullName });
    } else {
      notify(full.athlete.userId, 'AT-12', {
        remetente: full.contractor.companyName ?? full.contractor.name,
      });
    }
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
