import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  RESEND_API_KEY: z.string().startsWith('re_'),
  EMAIL_FROM: z.string().email(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Firebase Admin (login social) — informe UM dos dois:
  //  • FIREBASE_SERVICE_ACCOUNT       → JSON do service account inline (recomendado em prod/secret)
  //  • FIREBASE_SERVICE_ACCOUNT_PATH  → caminho para o arquivo .json no servidor
  FIREBASE_SERVICE_ACCOUNT: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT_PATH: z.string().optional(),

  // Uploads (mídia da vitrine + avatar). Sem S3 ainda: disco local servido em /uploads.
  PUBLIC_URL: z.string().url().optional(),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:\n', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
