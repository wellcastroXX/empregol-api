import { FavoriteRepository } from './favorite.repository';
import { NotFoundError } from '../../shared/errors/app-error';
import { notify } from '../notifications/notifications.service';

export class FavoriteService {
  private readonly repo = new FavoriteRepository();

  async toggle(contractorUserId: string, athleteId: string) {
    const contractor = await this.repo.findContractorByUserId(contractorUserId);
    if (!contractor) throw new NotFoundError('Perfil de contratante não encontrado');

    const athlete = await this.repo.findAthleteById(athleteId);
    if (!athlete) throw new NotFoundError('Atleta não encontrado');

    const result = await this.repo.toggle(contractor.id, athlete.id);
    // Entrou na lista de um clube → push ao atleta (AT-11). Fire-and-forget.
    if (result.favorited) notify(athlete.userId, 'AT-11');
    return result;
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
