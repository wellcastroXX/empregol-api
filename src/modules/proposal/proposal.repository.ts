import { prisma } from '../../database/prisma';
import { CreateProposalDTO, RespondProposalDTO } from './proposal.dto';

export class ProposalRepository {
  async findContractorByUserId(userId: string) {
    return prisma.contractor.findUnique({ where: { userId } });
  }

  async findAthleteById(id: string) {
    return prisma.athlete.findUnique({ where: { id } });
  }

  async findAthleteByUserId(userId: string) {
    return prisma.athlete.findUnique({ where: { userId } });
  }

  async findExistingPending(athleteId: string, contractorId: string) {
    return prisma.proposal.findFirst({
      where: { athleteId, contractorId, status: 'PENDING' },
    });
  }

  async create(data: { athleteId: string; contractorId: string } & CreateProposalDTO) {
    return prisma.proposal.create({
      data: {
        athleteId: data.athleteId,
        contractorId: data.contractorId,
        message: data.message,
      },
      include: {
        contractor: { select: { id: true, name: true, type: true, avatarUrl: true, companyName: true } },
        athlete: { select: { id: true, fullName: true, position: true, avatarUrl: true } },
      },
    });
  }

  async findById(id: string) {
    return prisma.proposal.findUnique({
      where: { id },
      include: {
        contractor: { select: { id: true, name: true, type: true, avatarUrl: true, companyName: true, userId: true } },
        athlete: { select: { id: true, fullName: true, position: true, avatarUrl: true, userId: true } },
      },
    });
  }

  async respond(id: string, data: RespondProposalDTO) {
    return prisma.proposal.update({
      where: { id },
      data: { status: data.status, scheduledAt: data.scheduledAt },
    });
  }

  // Athlete: proposals received
  async listForAthlete(athleteId: string, status?: string) {
    return prisma.proposal.findMany({
      where: {
        athleteId,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        contractor: {
          select: { id: true, name: true, type: true, avatarUrl: true, companyName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Contractor: proposals sent
  async listForContractor(contractorId: string, status?: string) {
    return prisma.proposal.findMany({
      where: {
        contractorId,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        athlete: {
          select: { id: true, fullName: true, position: true, avatarUrl: true, level: true, availability: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countPendingForAthlete(athleteId: string): Promise<number> {
    return prisma.proposal.count({ where: { athleteId, status: 'PENDING' } });
  }
}
