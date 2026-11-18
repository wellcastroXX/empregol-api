import { ContractorRepository } from './contractor.repository';
import { UpdateContractorDTO } from './contractor.dto';
import { NotFoundError, ForbiddenError } from '../../shared/errors/app-error';
import { contractorVerification } from '../../shared/utils/verification.util';

/** Janela do indicador "ativo esta semana". */
const ACTIVE_WINDOW_DAYS = 7;

export class ContractorService {
  private readonly repo = new ContractorRepository();

  async getMyProfile(userId: string) {
    const contractor = await this.repo.findByUserId(userId);
    if (!contractor) throw new NotFoundError('Perfil de contratante não encontrado');
    const { verified, complete, missing } = contractorVerification(contractor);
    return {
      ...contractor,
      verified,
      verificationComplete: complete,
      verificationMissing: missing,
    };
  }

  /**
   * Perfil do clube/agência como o atleta vê.
   *
   * Lista branca explícita: o repositório traz `cnpj`, `cpf` e `companyName`
   * só para o cálculo do selo, e eles param aqui. A atividade sai como faixa
   * ("ativo esta semana"), não como timestamp — o atleta não precisa saber a
   * hora exata do último acesso de ninguém.
   */
  async getBasicProfile(id: string) {
    const contractor = await this.repo.findBasicById(id);
    if (!contractor) throw new NotFoundError('Contratante não encontrado');

    const { verified } = contractorVerification(contractor);
    const lastActive = contractor.user?.lastActiveAt;
    const activeThisWeek = lastActive
      ? Date.now() - lastActive.getTime() < ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000
      : false;

    return {
      id: contractor.id,
      type: contractor.type,
      name: contractor.name,
      avatarUrl: contractor.avatarUrl,
      about: contractor.additionalInfo,
      memberSince: contractor.createdAt,
      verified,
      activeThisWeek,
      status: contractor.user?.status,
    };
  }

  async getFullProfile(id: string) {
    const contractor = await this.repo.findById(id);
    if (!contractor) throw new NotFoundError('Contratante não encontrado');
    return contractor;
  }

  async updateProfile(userId: string, requesterId: string, dto: UpdateContractorDTO) {
    const contractor = await this.repo.findByUserId(userId);
    if (!contractor) throw new NotFoundError('Perfil de contratante não encontrado');

    if (contractor.userId !== requesterId) throw new ForbiddenError('Você só pode editar seu próprio perfil');

    return this.repo.update(userId, dto);
  }
}
