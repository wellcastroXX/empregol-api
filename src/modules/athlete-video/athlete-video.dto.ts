import { z } from 'zod';
import { MediaType } from '@prisma/client';

export const createMediaSchema = z.object({
  mediaType:    z.nativeEnum(MediaType),
  url:          z.string().url('URL inválida'),
  title:        z.string().min(1).max(100),
  year:         z.number().int().min(2000).max(2100),
  category:     z.string().max(60).optional(),
  subcategory:  z.string().max(60).optional(),
  gameInfo:     z.string().max(100).optional(),   // "Vitória 2 × 1 ABC · 14/10/2024"
  isPublic:     z.boolean().default(true),
  fileSizeBytes: z.number().int().positive().optional(),
});

export type CreateMediaDTO = z.infer<typeof createMediaSchema>;
