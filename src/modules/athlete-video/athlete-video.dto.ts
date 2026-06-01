import { z } from 'zod';

export const createVideoSchema = z.object({
  url:   z.string().url('URL do vídeo inválida'),
  title: z.string().max(100).optional(),
  year:  z.number().int().min(2000).max(2100),
});

export type CreateVideoDTO = z.infer<typeof createVideoSchema>;
