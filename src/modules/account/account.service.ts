import { prisma } from '../../database/prisma';
import { removeUploadedFiles } from '../../shared/upload/upload';

export class AccountService {
  /**
   * Exclui permanentemente a conta do usuário. O cascade (onDelete: Cascade)
   * remove perfil (atleta/contratante), mídias, conversas, favoritos, denúncias,
   * bloqueios, tokens de push, etc. — e também apagamos os arquivos de mídia do
   * disco, pra não deixar órfãos acumulando.
   */
  async deleteAccount(userId: string): Promise<void> {
    // Coleta os arquivos ANTES do delete (o cascade apaga as linhas de mídia).
    const [athlete, contractor] = await Promise.all([
      prisma.athlete.findUnique({
        where: { userId },
        select: { avatarUrl: true, media: { select: { url: true } } },
      }),
      prisma.contractor.findUnique({
        where: { userId },
        select: { avatarUrl: true },
      }),
    ]);

    const fileUrls = [
      athlete?.avatarUrl,
      contractor?.avatarUrl,
      ...(athlete?.media?.map((m) => m.url) ?? []),
    ];

    await prisma.user.delete({ where: { id: userId } });

    // Best-effort: remove os arquivos do disco (não falha a exclusão).
    removeUploadedFiles(fileUrls);
  }
}
