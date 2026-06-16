import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { MulterError } from 'multer';
import { AppError } from '../errors/app-error';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Upload errors (file too large, too many files, unexpected field…)
  if (err instanceof MulterError) {
    const tooLarge = err.code === 'LIMIT_FILE_SIZE';
    res.status(tooLarge ? 413 : 400).json({
      status: 'error',
      code: tooLarge ? 'FILE_TOO_LARGE' : 'UPLOAD_ERROR',
      message: tooLarge ? 'Arquivo excede o tamanho máximo permitido' : 'Falha no upload do arquivo',
    });
    return;
  }

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
