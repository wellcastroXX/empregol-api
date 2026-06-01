import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/app-error';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message,
      ...(err.statusCode === 422 && 'errors' in err ? { errors: (err as any).errors } : {}),
    });
    return;
  }

  // Prisma unique constraint violation
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    const fields = (err.meta?.target as string[]) ?? [];
    res.status(409).json({
      status: 'error',
      code: 'CONFLICT',
      message: `Já existe um registro com ${fields.join(', ')} informado(s).`,
    });
    return;
  }

  console.error('[Unhandled Error]', err);
  res.status(500).json({ status: 'error', code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' });
}
