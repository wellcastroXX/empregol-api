import { ContractorType, UserRole } from '@prisma/client';
import { ConversationRepository } from './conversation.repository';
import { NotFoundError, ForbiddenError } from '../../shared/errors/app-error';

export class ConversationService {
  private readonly repo = new ConversationRepository();

  // Contractor opens a conversation with an athlete (or returns existing one)
  async openOrGet(contractorUserId: string, athleteId: string) {
    const contractor = await this.repo.findContractorByUserId(contractorUserId);
    if (!contractor) throw new NotFoundError('Perfil de contratante não encontrado');

    // athleteId param is Athlete.id (not userId)
    const athleteById = await this.repo.findAthleteById(athleteId);
    if (!athleteById) throw new NotFoundError('Atleta não encontrado');

    const { conversation, created } = await this.repo.findOrCreate(athleteById.id, contractor.id);
    return { conversation, created };
  }

  async listMine(userId: string, role: UserRole, query: { filter?: string }) {
    const { filter } = query;

    if (role === 'ATHLETE') {
      const athlete = await this.repo.findAthleteByUserId(userId);
      if (!athlete) throw new NotFoundError('Perfil não encontrado');

      const unreadOnly = filter === 'unread';
      const contractorType = filter === 'agents' ? ContractorType.AGENT
        : filter === 'clubs' ? ContractorType.CLUB
        : undefined;

      return this.repo.listForAthlete(athlete.id, { unreadOnly, contractorType });
    }

    const contractor = await this.repo.findContractorByUserId(userId);
    if (!contractor) throw new NotFoundError('Perfil não encontrado');
    return this.repo.listForContractor(contractor.id, { unreadOnly: filter === 'unread' });
  }

  async markRead(userId: string, role: UserRole, conversationId: string) {
    const conversation = await this.repo.findById(conversationId);
    if (!conversation) throw new NotFoundError('Conversa não encontrada');

    if (role === 'ATHLETE') {
      const athlete = await this.repo.findAthleteByUserId(userId);
      if (conversation.athleteId !== athlete?.id) throw new ForbiddenError();
      return this.repo.markRead(conversationId, 'ATHLETE');
    }

    const contractor = await this.repo.findContractorByUserId(userId);
    if (conversation.contractorId !== contractor?.id) throw new ForbiddenError();
    return this.repo.markRead(conversationId, 'CONTRACTOR');
  }
}
