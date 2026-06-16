import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { Request } from 'express';
import { env } from '../../config/env';
import { AppError } from '../errors/app-error';

/** Absolute path to the local uploads directory (created on load). */
export const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
fs.mkdirSync(uploadDir, { recursive: true });

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/heic': '.heic',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'video/x-matroska': '.mkv',
  'video/webm': '.webm',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || EXT_BY_MIME[file.mimetype] || '';
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

function imageOrVideoFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
    return;
  }
  cb(new AppError('Apenas imagens ou vídeos são aceitos', 415, 'UNSUPPORTED_MEDIA_TYPE'));
}

function imageOnlyFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }
  cb(new AppError('Apenas imagens são aceitas', 415, 'UNSUPPORTED_MEDIA_TYPE'));
}

const limits = { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: 1 };

/** Accepts a single image **or** video under field `file` (vitrine media). */
export const uploadMedia = multer({ storage, fileFilter: imageOrVideoFilter, limits }).single('file');

/** Accepts a single image under field `file` (user avatar / photo). */
export const uploadImage = multer({ storage, fileFilter: imageOnlyFilter, limits }).single('file');

/** Public URL for a stored file, e.g. `${PUBLIC_URL}/uploads/<name>`. */
export function publicUrlFor(filename: string): string {
  const base = (env.PUBLIC_URL ?? `http://localhost:${env.PORT}`).replace(/\/$/, '');
  return `${base}/uploads/${filename}`;
}
