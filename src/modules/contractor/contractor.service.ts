import { ContractorRepository } from './contractor.repository';
import { UpdateContractorDTO } from './contractor.dto';
import { NotFoundError, ForbiddenError } from '../../shared/errors/app-error';

export class ContractorService {
  private readonly repo = new ContractorRepository();

  async getMyProfile(userId: string) {
    const contractor = await this.repo.findByUserId(userId);
    if (!contractor) throw new NotFoundError('Perfil de contratante não encontrado');
    return contractor;
  }

  async getBasicProfile(id: string) {
    const contractor = await this.repo.findBasicById(id);
    if (!contractor) throw new NotFoundError('Contratante não encontrado');
    return contractor;
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
