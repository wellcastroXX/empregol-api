import { prisma } from '../../../database/prisma';
import { RegisterAthleteDTO } from './auth-athlete.dto';

export class AuthAthleteRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { athlete: true },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { athlete: true },
    });
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await prisma.user.count({ where: { email } });
    return count > 0;
  }

  async cpfExists(cpf: string): Promise<boolean> {
    const count = await prisma.athlete.count({ where: { cpf } });
    return count > 0;
  }

  async createAthleteWithUser(data: RegisterAthleteDTO & { hashedPassword: string }) {
    const { email, hashedPassword, ...athleteData } = data;
    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ATHLETE',
        athlete: { create: athleteData },
      },
      include: { athlete: true },
    });
  }

  async markEmailVerified(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true, status: 'ACTIVE' },
    });
  }

  async updatePassword(userId: string, hashedPassword: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  // ─── Email verification codes ────────────────────────────────────────────────

  async createVerificationCode(userId: string, code: string) {
    await prisma.emailVerificationCode.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });
    return prisma.emailVerificationCode.create({
      data: {
        userId,
        code,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
  }

  async findValidCode(userId: string, code: string) {
    return prisma.emailVerificationCode.findFirst({
      where: { userId, code, used: false, expiresAt: { gt: new Date() } },
    });
  }

  async markCodeUsed(id: string) {
    return prisma.emailVerificationCode.update({ where: { id }, data: { used: true } });
  }

  // ─── Password reset ───────────────────────────────────────────────────────────

  async createPasswordReset(userId: string, token: string) {
    await prisma.passwordReset.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });
    return prisma.passwordReset.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
  }

  async findValidPasswordReset(token: string) {
    return prisma.passwordReset.findFirst({
      where: { token, used: false, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
  }

  async markPasswordResetUsed(id: string) {
    return prisma.passwordReset.update({ where: { id }, data: { used: true } });
  }
}
