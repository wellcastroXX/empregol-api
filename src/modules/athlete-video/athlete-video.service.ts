import { AthleteVideoRepository } from './athlete-video.repository';
import { CreateVideoDTO } from './athlete-video.dto';
import { NotFoundError, ForbiddenError, AppError } from '../../shared/errors/app-error';

const MAX_VIDEOS = 10;

export class AthleteVideoService {
  private readonly repo = new AthleteVideoRepository();

  async add(userId: string, dto: CreateVideoDTO) {
    const athlete = await this.repo.findAthleteByUserId(userId);
    if (!athlete) throw new NotFoundError('Perfil de atleta não encontrado');

    const count = await this.repo.countByAthlete(athlete.id);
    if (count >= MAX_VIDEOS) {
      throw new AppError(`Limite de ${MAX_VIDEOS} vídeos atingido`, 400, 'VIDEO_LIMIT_REACHED');
    }

    return this.repo.create(athlete.id, dto);
  }

  async list(userId: string) {
    const athlete = await this.repo.findAthleteByUserId(userId);
    if (!athlete) throw new NotFoundError('Perfil de atleta não encontrado');
    return this.repo.list(athlete.id);
  }

  async remove(userId: string, videoId: string) {
    const athlete = await this.repo.findAthleteByUserId(userId);
    if (!athlete) throw new NotFoundError('Perfil de atleta não encontrado');

    const video = await this.repo.findById(videoId);
    if (!video) throw new NotFoundError('Vídeo não encontrado');
    if (video.athleteId !== athlete.id) throw new ForbiddenError();

    return this.repo.delete(videoId);
  }
}
