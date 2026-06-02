import { prisma } from '../../../database/prisma';
import { RegisterContractorDTO } from './auth-contractor.dto';
import { UserRole } from '@prisma/client';

export class AuthContractorRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { contractor: true },
    });
  }

  async emailExists(email: string): Promise<boolean> {
    return (await prisma.user.count({ where: { email } })) > 0;
  }

  async cpfExists(cpf: string): Promise<boolean> {
    return (await prisma.contractor.count({ where: { cpf } })) > 0;
  }

  async cnpjExists(cnpj: string): Promise<boolean> {
    return (await prisma.contractor.count({ where: { cnpj } })) > 0;
  }

  async createContractorWithUser(data: RegisterContractorDTO & { hashedPassword: string }) {
    // `password` (texto puro) não é coluna de Contractor — remover do nested create.
    const { email, password: _password, hashedPassword, type, ...contractorFields } = data;
    const role: UserRole = type === 'AGENT' ? 'AGENT' : 'CLUB';

    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        contractor: { create: { type, ...contractorFields } },
      },
      include: { contractor: true },
    });
  }

  async markEmailVerified(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true, status: 'ACTIVE' },
    });
  }

  async updatePassword(userId: string, hashedPassword: string) {
    return prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
  }

  async createVerificationCode(userId: string, code: string) {
    await prisma.emailVerificationCode.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });
    return prisma.emailVerificationCode.create({
      data: { userId, code, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
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

  async createPasswordReset(userId: string, token: string) {
    await prisma.passwordReset.updateMany({ where: { userId, used: false }, data: { used: true } });
    return prisma.passwordReset.create({
      data: { userId, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
  }

  async findValidPasswordReset(token: string) {
    return prisma.passwordReset.findFirst({
      where: { token, used: false, expiresAt: { gt: new Date() } },
      include: { user: { include: { contractor: true } } },
    });
  }

  async markPasswordResetUsed(id: string) {
    return prisma.passwordReset.update({ where: { id }, data: { used: true } });
  }
}
