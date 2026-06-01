import { ProposalRepository } from './proposal.repository';
import { CreateProposalDTO, RespondProposalDTO } from './proposal.dto';
import { AppError, NotFoundError, ForbiddenError, ConflictError } from '../../shared/errors/app-error';

export class ProposalService {
  private readonly repo = new ProposalRepository();

  // Contractor sends an invite to an athlete
  async create(contractorUserId: string, dto: CreateProposalDTO) {
    const contractor = await this.repo.findContractorByUserId(contractorUserId);
    if (!contractor) throw new NotFoundError('Perfil de contratante não encontrado');

    const athlete = await this.repo.findAthleteById(dto.athleteId);
    if (!athlete) throw new NotFoundError('Atleta não encontrado');

    const existing = await this.repo.findExistingPending(athlete.id, contractor.id);
    if (existing) throw new ConflictError('Já existe um convite pendente para este atleta');

    return this.repo.create({ athleteId: athlete.id, contractorId: contractor.id, message: dto.message });
  }

  // Athlete responds to a proposal
  async respond(proposalId: string, athleteUserId: string, dto: RespondProposalDTO) {
    const proposal = await this.repo.findById(proposalId);
    if (!proposal) throw new NotFoundError('Convite não encontrado');

    if (proposal.athlete.userId !== athleteUserId) throw new ForbiddenError();
    if (proposal.status !== 'PENDING') {
      throw new AppError('Este convite já foi respondido', 400, 'ALREADY_RESPONDED');
    }

    return this.repo.respond(proposalId, dto);
  }

  // Athlete lists their received proposals
  async listForAthlete(athleteUserId: string, status?: string) {
    const athlete = await this.repo.findAthleteByUserId(athleteUserId);
    if (!athlete) throw new NotFoundError('Perfil de atleta não encontrado');
    return this.repo.listForAthlete(athlete.id, status);
  }

  // Contractor lists proposals they sent
  async listForContractor(contractorUserId: string, status?: string) {
    const contractor = await this.repo.findContractorByUserId(contractorUserId);
    if (!contractor) throw new NotFoundError('Perfil de contratante não encontrado');
    return this.repo.listForContractor(contractor.id, status);
  }
}
