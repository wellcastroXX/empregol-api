import { AthleteRepository } from './athlete.repository';
import { UpdateAthleteDTO } from './athlete.dto';
import { NotFoundError, ForbiddenError } from '../../shared/errors/app-error';

export class AthleteService {
  private readonly repo = new AthleteRepository();

  async getMyProfile(userId: string) {
    const athlete = await this.repo.findByUserId(userId);
    if (!athlete) throw new NotFoundError('Perfil de atleta não encontrado');
    return athlete;
  }

  async getBasicProfile(id: string) {
    const athlete = await this.repo.findBasicById(id);
    if (!athlete) throw new NotFoundError('Atleta não encontrado');
    return athlete;
  }

  async getFullProfile(id: string) {
    const athlete = await this.repo.findById(id);
    if (!athlete) throw new NotFoundError('Atleta não encontrado');
    return athlete;
  }

  async listAthletes(query: { page?: number; limit?: number; position?: string; level?: string; availability?: string }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 20));
    return this.repo.listAthletes({ page, limit, position: query.position, level: query.level, availability: query.availability });
  }

  async updateProfile(userId: string, requesterId: string, requesterRole: string, dto: UpdateAthleteDTO) {
    const athlete = await this.repo.findByUserId(userId);
    if (!athlete) throw new NotFoundError('Perfil de atleta não encontrado');

    if (requesterRole === 'ATHLETE' && athlete.userId !== requesterId) {
      throw new ForbiddenError('Você só pode editar seu próprio perfil');
    }

    return this.repo.update(userId, dto);
  }
}
