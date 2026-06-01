import { prisma } from '../../database/prisma';
import { CreateVideoDTO } from './athlete-video.dto';

export class AthleteVideoRepository {
  async findAthleteByUserId(userId: string) {
    return prisma.athlete.findUnique({ where: { userId } });
  }

  async create(athleteId: string, dto: CreateVideoDTO) {
    return prisma.athleteVideo.create({ data: { athleteId, ...dto } });
  }

  async list(athleteId: string) {
    return prisma.athleteVideo.findMany({
      where: { athleteId },
      orderBy: { year: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.athleteVideo.findUnique({ where: { id } });
  }

  async delete(id: string) {
    return prisma.athleteVideo.delete({ where: { id } });
  }

  async countByAthlete(athleteId: string): Promise<number> {
    return prisma.athleteVideo.count({ where: { athleteId } });
  }
}
