import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt.util';
import { UnauthorizedError, ForbiddenError } from '../errors/app-error';
import { prisma } from '../../database/prisma';

// Throttle de escrita do lastActiveAt: no máx. 1 update a cada 30 min por user.
const lastTouch = new Map<string, number>();
const TOUCH_INTERVAL_MS = 30 * 60 * 1000;

function touchLastActive(userId: string): void {
  const now = Date.now();
  const prev = lastTouch.get(userId) ?? 0;
  if (now - prev < TOUCH_INTERVAL_MS) return;
  lastTouch.set(userId, now);
  prisma.user
    .update({ where: { id: userId }, data: { lastActiveAt: new Date() } })
    .catch(() => undefined); // fire-and-forget
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('Token não fornecido');

  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    touchLastActive(payload.sub);
    next();
  } catch {
    throw new UnauthorizedError('Token inválido ou expirado');
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new UnauthorizedError();
    if (!roles.includes(req.user.role)) throw new ForbiddenError();
    next();
  };
}
