import { AuthSocialRepository } from './auth-social.repository';
import { SocialLoginDTO } from './auth-social.dto';
import { signAccessToken, signRefreshToken } from '../../../shared/utils/jwt.util';
import { verifyFirebaseIdToken } from '../../../shared/utils/firebase.util';
import { AppError } from '../../../shared/errors/app-error';

export class AuthSocialService {
  private readonly repo = new AuthSocialRepository();

  /**
   * Login via Google/Apple (Firebase). Matches an EXISTING account by the
   * provider-verified e-mail and issues our JWT. New users still register
   * through the normal flow (athletes need CPF, position, etc.).
   */
  async login(dto: SocialLoginDTO) {
    const identity = await verifyFirebaseIdToken(dto.idToken);

    if (!identity.email) {
      throw new AppError(
        'Não foi possível obter o e-mail da conta social. Use um e-mail visível ou entre com e-mail e senha.',
        400,
        'SOCIAL_NO_EMAIL',
      );
    }

    const user = await this.repo.findUserByEmail(identity.email.toLowerCase());
    if (!user) {
      throw new AppError(
        'Nenhuma conta encontrada com esse e-mail. Cadastre-se primeiro.',
        404,
        'NO_ACCOUNT',
      );
    }

    // Social login proves e-mail ownership → activate if still pending.
    if (!user.emailVerified) await this.repo.markEmailVerified(user.id);

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        athlete: user.athlete,
        contractor: user.contractor,
      },
    };
  }
}
