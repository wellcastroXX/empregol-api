import { FavoriteRepository } from './favorite.repository';
import { NotFoundError } from '../../shared/errors/app-error';

export class FavoriteService {
  private readonly repo = new FavoriteRepository();

  async toggle(contractorUserId: string, athleteId: string) {
    const contractor = await this.repo.findContractorByUserId(contractorUserId);
    if (!contractor) throw new NotFoundError('Perfil de contratante não encontrado');

    const athlete = await this.repo.findAthleteById(athleteId);
    if (!athlete) throw new NotFoundError('Atleta não encontrado');

    return this.repo.toggle(contractor.id, athlete.id);
  }

  async list(contractorUserId: string) {
    const contractor = await this.repo.findContractorByUserId(contractorUserId);
    if (!contractor) throw new NotFoundError('Perfil de contratante não encontrado');

    const favorites = await this.repo.list(contractor.id);
    return favorites.map((f) => ({
      ...f.athlete,
      age: f.athlete.birthDate
        ? Math.floor((Date.now() - new Date(f.athlete.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null,
      favoritedAt: f.createdAt,
      birthDate: undefined,
    }));
  }
}
