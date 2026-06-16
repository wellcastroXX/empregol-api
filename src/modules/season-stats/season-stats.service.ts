import { SeasonStatsRepository } from './season-stats.repository';
import { UpsertSeasonStatsDTO } from './season-stats.dto';
import { NotFoundError } from '../../shared/errors/app-error';

export class SeasonStatsService {
  private readonly repo = new SeasonStatsRepository();

  async upsert(userId: string, dto: UpsertSeasonStatsDTO) {
    const athlete = await this.repo.findAthleteByUserId(userId);
    if (!athlete) throw new NotFoundError('Perfil de atleta não encontrado');

    const stats = await this.repo.upsert(athlete.id, dto);
    await this.repo.syncLatestToAthlete(athlete.id);
    return stats;
  }

  async list(userId: string) {
    const athlete = await this.repo.findAthleteByUserId(userId);
    if (!athlete) throw new NotFoundError('Perfil de atleta não encontrado');
    return this.repo.listByAthlete(athlete.id);
  }

  async getByYear(userId: string, year: number) {
    const athlete = await this.repo.findAthleteByUserId(userId);
    if (!athlete) throw new NotFoundError('Perfil de atleta não encontrado');

    const stats = await this.repo.findByYear(athlete.id, year);
    if (!stats) throw new NotFoundError(`Sem estatísticas para o ano ${year}`);
    return stats;
  }

  async remove(userId: string, year: number) {
    const athlete = await this.repo.findAthleteByUserId(userId);
    if (!athlete) throw new NotFoundError('Perfil de atleta não encontrado');

    const stats = await this.repo.findByYear(athlete.id, year);
    if (!stats) throw new NotFoundError(`Sem estatísticas para o ano ${year}`);

    await this.repo.deleteByYear(athlete.id, year);

    // Re-sincroniza o perfil: nova temporada mais recente, ou zera se não houver mais.
    if ((await this.repo.countByAthlete(athlete.id)) > 0) {
      await this.repo.syncLatestToAthlete(athlete.id);
    } else {
      await this.repo.clearAthleteStats(athlete.id);
    }
  }
}
