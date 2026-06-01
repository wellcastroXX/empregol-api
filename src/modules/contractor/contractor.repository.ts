import { prisma } from '../../database/prisma';
import { UpdateContractorDTO } from './contractor.dto';

export class ContractorRepository {
  async findByUserId(userId: string) {
    return prisma.contractor.findUnique({ where: { userId } });
  }

  async findById(id: string) {
    return prisma.contractor.findUnique({
      where: { id },
      include: { user: { select: { email: true, status: true, emailVerified: true } } },
    });
  }

  async findBasicById(id: string) {
    return prisma.contractor.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        name: true,
        phone: true,
        companyName: true,
        socialMedia: true,
        avatarUrl: true,
        user: { select: { status: true, emailVerified: true } },
      },
    });
  }

  async update(userId: string, data: UpdateContractorDTO) {
    return prisma.contractor.update({ where: { userId }, data });
  }
}
