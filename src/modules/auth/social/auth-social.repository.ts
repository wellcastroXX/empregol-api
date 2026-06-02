import { prisma } from '../../../database/prisma';

export class AuthSocialRepository {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { athlete: true, contractor: true },
    });
  }

  markEmailVerified(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true, status: 'ACTIVE' },
    });
  }
}
