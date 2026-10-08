import { z } from 'zod';

export const createReportSchema = z.object({
  reportedUserId: z.string().min(1, 'Usuário inválido'),
  reason: z.enum(['spam', 'harassment', 'inappropriate', 'fake', 'other']),
  details: z.string().max(1000).optional(),
  context: z.enum(['profile', 'chat', 'media']).optional(),
});

export const blockSchema = z.object({
  userId: z.string().min(1, 'Usuário inválido'),
});

export type CreateReportDTO = z.infer<typeof createReportSchema>;
export type BlockDTO = z.infer<typeof blockSchema>;
