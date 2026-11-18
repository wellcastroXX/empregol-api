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

  /**
   * Perfil que um atleta pode ver de um clube/agência.
   *
   * `phone` e `socialMedia` saíram daqui: esta rota é aberta a qualquer
   * usuário autenticado, e o contato do contratante não é dado que o atleta
   * precise ver — quem inicia conversa é o contratante. `cnpj`, `cpf` e
   * `companyName` entram só para calcular o selo verificado e são descartados
   * pelo service antes da resposta (ver `getBasicProfile`).
   */
  async findBasicById(id: string) {
    return prisma.contractor.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        name: true,
        companyName: true,
        avatarUrl: true,
        additionalInfo: true,
        createdAt: true,
        cnpj: true,
        cpf: true,
        verificationBlocked: true,
        user: { select: { status: true, emailVerified: true, lastActiveAt: true } },
      },
    });
  }

  async update(userId: string, data: UpdateContractorDTO) {
    return prisma.contractor.update({ where: { userId }, data });
  }
}
