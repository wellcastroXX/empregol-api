import { MediaType } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { CreateMediaDTO } from './athlete-video.dto';

export class AthleteVideoRepository {
  async findAthleteByUserId(userId: string) {
    return prisma.athlete.findUnique({ where: { userId } });
  }

  async create(athleteId: string, dto: CreateMediaDTO) {
    return prisma.athleteMedia.create({ data: { athleteId, ...dto } });
  }

  async list(athleteId: string, mediaType?: MediaType) {
    return prisma.athleteMedia.findMany({
      where: { athleteId, ...(mediaType ? { mediaType } : {}) },
      orderBy: { year: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.athleteMedia.findUnique({ where: { id } });
  }

  async delete(id: string) {
    return prisma.athleteMedia.delete({ where: { id } });
  }

  async countByAthlete(athleteId: string): Promise<number> {
    return prisma.athleteMedia.count({ where: { athleteId } });
  }
}
