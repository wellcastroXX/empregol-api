import { MediaType } from '@prisma/client';
import { AthleteVideoRepository } from './athlete-video.repository';
import { CreateMediaDTO } from './athlete-video.dto';
import { NotFoundError, ForbiddenError, AppError } from '../../shared/errors/app-error';

const MAX_MEDIA = 20;

export class AthleteVideoService {
  private readonly repo = new AthleteVideoRepository();

  async add(userId: string, dto: CreateMediaDTO) {
    const athlete = await this.repo.findAthleteByUserId(userId);
    if (!athlete) throw new NotFoundError('Perfil de atleta não encontrado');

    const count = await this.repo.countByAthlete(athlete.id);
    if (count >= MAX_MEDIA) {
      throw new AppError(`Limite de ${MAX_MEDIA} mídias atingido`, 400, 'MEDIA_LIMIT_REACHED');
    }

    return this.repo.create(athlete.id, dto);
  }

  async list(userId: string, type?: string) {
    const athlete = await this.repo.findAthleteByUserId(userId);
    if (!athlete) throw new NotFoundError('Perfil de atleta não encontrado');
    const mediaType = type as MediaType | undefined;
    return this.repo.list(athlete.id, mediaType);
  }

  async remove(userId: string, mediaId: string) {
    const athlete = await this.repo.findAthleteByUserId(userId);
    if (!athlete) throw new NotFoundError('Perfil de atleta não encontrado');

    const media = await this.repo.findById(mediaId);
    if (!media) throw new NotFoundError('Mídia não encontrada');
    if (media.athleteId !== athlete.id) throw new ForbiddenError();

    return this.repo.delete(mediaId);
  }
}
