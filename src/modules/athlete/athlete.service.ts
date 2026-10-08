import { AthleteRepository } from './athlete.repository';
import { UpdateAthleteDTO } from './athlete.dto';
import { NotFoundError, ForbiddenError } from '../../shared/errors/app-error';
import { publicUrlFor } from '../../shared/upload/upload';
import { blockedUserIds } from '../moderation/moderation.service';
import { ageFrom, uniqueSlug } from '../../shared/utils/slug.util';

/** Termos, cláusula 3.2(d): menor de 18 fica nas configurações mais protetivas. */
const MIN_PUBLIC_AGE = 18;

export class AthleteService {
  private readonly repo = new AthleteRepository();

  /** Persists an uploaded photo as the athlete's avatar; returns the new URL. */
  async updateAvatar(userId: string, file: Express.Multer.File) {
    const athlete = await this.repo.findByUserId(userId);
    if (!athlete) throw new NotFoundError('Perfil de atleta não encontrado');

    const avatarUrl = publicUrlFor(file.filename, 'avatars');
    const updated = await this.repo.update(userId, { avatarUrl });
    return { avatarUrl, athlete: updated };
  }

  async getMyProfile(userId: string) {
    const athlete = await this.repo.findByUserId(userId);
    if (!athlete) throw new NotFoundError('Perfil de atleta não encontrado');

    // Quem se cadastrou menor entra fechado; ao completar 18 anos a vitrine
    // abre sozinha, que é o padrão de quem é maior. `slug` nulo é o que separa
    // "nunca teve vitrine" de "abriu e fechou" — fechar não apaga o slug, então
    // quem desligou de propósito continua desligado.
    const shouldOpen =
      !athlete.publicProfile && !athlete.slug && ageFrom(athlete.birthDate) >= MIN_PUBLIC_AGE;

    if (shouldOpen) {
      const slug = await uniqueSlug(athlete.fullName, (candidate) =>
        this.repo.isSlugTaken(candidate),
      );
      return this.repo.openShowcase(athlete.id, slug);
    }

    return athlete;
  }

  async getBasicProfile(id: string) {
    const athlete = await this.repo.findBasicById(id);
    if (!athlete) throw new NotFoundError('Atleta não encontrado');
    return athlete;
  }

  /**
   * Vitrine pública, sem token. Só responde quando o atleta ligou a vitrine.
   *
   * Devolve a idade em vez da data de nascimento: numa página aberta e
   * indexável, data exata é dado pessoal que ninguém precisa ver.
   */
  async getPublicProfile(slug: string) {
    const athlete = await this.repo.findPublicBySlug(slug);
    if (!athlete) throw new NotFoundError('Perfil não encontrado');

    const { birthDate, ...rest } = athlete;
    const years = ageFrom(birthDate);

    // Cinto e suspensório: a vitrine de menor não deveria estar ligada, mas se
    // um aniversário ou uma correção de data virar o jogo, ela fecha sozinha.
    if (years < MIN_PUBLIC_AGE) throw new NotFoundError('Perfil não encontrado');

    return { ...rest, age: years };
  }

  async getFullProfile(id: string) {
    const athlete = await this.repo.findById(id);
    if (!athlete) throw new NotFoundError('Atleta não encontrado');
    return athlete;
  }

  async listAthletes(query: { page?: number; limit?: number; position?: string; level?: string; availability?: string; requesterId?: string }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 20));
    // Esconde da descoberta atletas bloqueados (em qualquer direção).
    const excludeUserIds = query.requesterId ? await blockedUserIds(query.requesterId) : [];
    return this.repo.listAthletes({ page, limit, position: query.position, level: query.level, availability: query.availability, excludeUserIds });
  }

  async updateProfile(userId: string, requesterId: string, requesterRole: string, dto: UpdateAthleteDTO) {
    const athlete = await this.repo.findByUserId(userId);
    if (!athlete) throw new NotFoundError('Perfil de atleta não encontrado');

    if (requesterRole === 'ATHLETE' && athlete.userId !== requesterId) {
      throw new ForbiddenError('Você só pode editar seu próprio perfil');
    }

    // Mantém a posição principal em sincronia com o array (1ª = principal).
    const data = { ...dto };
    if (data.positions?.length) data.position = data.positions[0];

    // Abrir a vitrine pública: só maior de 18, e o slug nasce aqui — não no
    // cadastro, porque a maioria dos atletas nunca vai abrir a vitrine.
    if (data.publicProfile === true) {
      if (ageFrom(athlete.birthDate) < MIN_PUBLIC_AGE) {
        throw new ForbiddenError(
          'A vitrine pública está disponível a partir dos 18 anos. Até lá, seu perfil só aparece para clubes e agentes aprovados.',
        );
      }

      if (!athlete.slug) {
        const slug = await uniqueSlug(data.fullName ?? athlete.fullName, (candidate) =>
          this.repo.isSlugTaken(candidate),
        );
        await this.repo.setSlug(athlete.id, slug);
      }
    }

    return this.repo.update(userId, data);
  }
}
