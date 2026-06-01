import { AuthAthleteRepository } from './auth-athlete.repository';
import {
  RegisterAthleteDTO,
  LoginDTO,
  VerifyEmailDTO,
  ResendCodeDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
} from './auth-athlete.dto';
import { hashPassword, comparePassword, generateNumericCode, generateSecureToken } from '../../../shared/utils/hash.util';
import { signAccessToken, signRefreshToken } from '../../../shared/utils/jwt.util';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../../shared/utils/email.util';
import { AppError, ConflictError, UnauthorizedError, NotFoundError } from '../../../shared/errors/app-error';

export class AuthAthleteService {
  private readonly repo = new AuthAthleteRepository();

  async register(dto: RegisterAthleteDTO) {
    if (await this.repo.emailExists(dto.email)) {
      throw new ConflictError('Este e-mail já está em uso');
    }
    if (await this.repo.cpfExists(dto.cpf)) {
      throw new ConflictError('Este CPF já está cadastrado');
    }

    const hashedPassword = await hashPassword(dto.password);
    const user = await this.repo.createAthleteWithUser({ ...dto, hashedPassword });

    const code = generateNumericCode(6);
    await this.repo.createVerificationCode(user.id, code);
    await sendVerificationEmail(user.email, user.athlete!.fullName, code);

    return { message: 'Cadastro realizado. Verifique seu e-mail para ativar a conta.' };
  }

  async login(dto: LoginDTO) {
    const user = await this.repo.findUserByEmail(dto.email);
    if (!user) throw new UnauthorizedError('E-mail ou senha inválidos');

    const valid = await comparePassword(dto.password, user.password);
    if (!valid) throw new UnauthorizedError('E-mail ou senha inválidos');

    if (user.role !== 'ATHLETE') throw new UnauthorizedError('Rota exclusiva para atletas');

    if (!user.emailVerified) {
      throw new AppError('Conta não verificada. Verifique seu e-mail antes de fazer login.', 403, 'EMAIL_NOT_VERIFIED');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        athlete: user.athlete,
      },
    };
  }

  async verifyEmail(dto: VerifyEmailDTO) {
    const user = await this.repo.findUserByEmail(dto.email);
    if (!user) throw new NotFoundError('Usuário não encontrado');

    const record = await this.repo.findValidCode(user.id, dto.code);
    if (!record) throw new AppError('Código inválido ou expirado', 400, 'INVALID_CODE');

    await this.repo.markCodeUsed(record.id);
    await this.repo.markEmailVerified(user.id);

    return { message: 'E-mail verificado com sucesso. Você já pode fazer login.' };
  }

  async resendCode(dto: ResendCodeDTO) {
    const user = await this.repo.findUserByEmail(dto.email);
    if (!user) throw new NotFoundError('Usuário não encontrado');
    if (user.emailVerified) throw new AppError('E-mail já verificado', 400, 'ALREADY_VERIFIED');

    const code = generateNumericCode(6);
    await this.repo.createVerificationCode(user.id, code);
    await sendVerificationEmail(user.email, user.athlete?.fullName ?? 'Atleta', code);

    return { message: 'Código reenviado para seu e-mail.' };
  }

  async forgotPassword(dto: ForgotPasswordDTO) {
    const user = await this.repo.findUserByEmail(dto.email);
    if (!user || user.role !== 'ATHLETE') {
      // Retorno genérico para não revelar se o e-mail existe
      return { message: 'Se o e-mail estiver cadastrado, você receberá as instruções.' };
    }

    const token = generateSecureToken();
    await this.repo.createPasswordReset(user.id, token);
    await sendPasswordResetEmail(user.email, user.athlete?.fullName ?? 'Atleta', token);

    return { message: 'Se o e-mail estiver cadastrado, você receberá as instruções.' };
  }

  async resetPassword(dto: ResetPasswordDTO) {
    const record = await this.repo.findValidPasswordReset(dto.token);
    if (!record) throw new AppError('Token inválido ou expirado', 400, 'INVALID_TOKEN');

    const hashed = await hashPassword(dto.password);
    await this.repo.updatePassword(record.userId, hashed);
    await this.repo.markPasswordResetUsed(record.id);

    return { message: 'Senha redefinida com sucesso.' };
  }
}
