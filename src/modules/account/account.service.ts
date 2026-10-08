import { prisma } from '../../database/prisma';

export class AccountService {
  /**
   * Exclui permanentemente a conta do usuário. O cascade (onDelete: Cascade)
   * remove perfil (atleta/contratante), mídias, conversas, favoritos, denúncias,
   * bloqueios, tokens de push, etc.
   */
  async deleteAccount(userId: string): Promise<void> {
    await prisma.user.delete({ where: { id: userId } });
  }
}
