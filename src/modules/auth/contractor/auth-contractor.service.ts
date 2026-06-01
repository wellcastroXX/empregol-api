import { AuthContractorRepository } from './auth-contractor.repository';
import {
  RegisterContractorDTO,
  LoginDTO,
  VerifyEmailDTO,
  ResendCodeDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
} from './auth-contractor.dto';
import { hashPassword, comparePassword, generateNumericCode, generateSecureToken } from '../../../shared/utils/hash.util';
import { signAccessToken, signRefreshToken } from '../../../shared/utils/jwt.util';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../../shared/utils/email.util';
import { AppError, ConflictError, UnauthorizedError, NotFoundError } from '../../../shared/errors/app-error';

export class AuthContractorService {
  private readonly repo = new AuthContractorRepository();

  async register(dto: RegisterContractorDTO) {
    if (await this.repo.emailExists(dto.email)) throw new ConflictError('Este e-mail já está em uso');
    if (dto.cpf && (await this.repo.cpfExists(dto.cpf))) throw new ConflictError('Este CPF já está cadastrado');
    if (dto.cnpj && (await this.repo.cnpjExists(dto.cnpj))) throw new ConflictError('Este CNPJ já está cadastrado');

    const hashedPassword = await hashPassword(dto.password);
    const user = await this.repo.createContractorWithUser({ ...dto, hashedPassword });

    const code = generateNumericCode(6);
    await this.repo.createVerificationCode(user.id, code);
    await sendVerificationEmail(user.email, user.contractor!.name, code);

    return { message: 'Cadastro realizado. Verifique seu e-mail para ativar a conta.' };
  }

  async login(dto: LoginDTO) {
    const user = await this.repo.findUserByEmail(dto.email);
    if (!user) throw new UnauthorizedError('E-mail ou senha inválidos');

    const valid = await comparePassword(dto.password, user.password);
    if (!valid) throw new UnauthorizedError('E-mail ou senha inválidos');

    if (user.role !== 'AGENT' && user.role !== 'CLUB') {
      throw new UnauthorizedError('Rota exclusiva para agentes e clubes');
    }

    if (!user.emailVerified) {
      throw new AppError('Conta não verificada. Verifique seu e-mail antes de fazer login.', 403, 'EMAIL_NOT_VERIFIED');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: { id: user.id, email: user.email, role: user.role, contractor: user.contractor },
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
    await sendVerificationEmail(user.email, user.contractor?.name ?? 'Contratante', code);

    return { message: 'Código reenviado para seu e-mail.' };
  }

  async forgotPassword(dto: ForgotPasswordDTO) {
    const user = await this.repo.findUserByEmail(dto.email);
    if (!user || (user.role !== 'AGENT' && user.role !== 'CLUB')) {
      return { message: 'Se o e-mail estiver cadastrado, você receberá as instruções.' };
    }

    const token = generateSecureToken();
    await this.repo.createPasswordReset(user.id, token);
    await sendPasswordResetEmail(user.email, user.contractor?.name ?? 'Contratante', token);

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
