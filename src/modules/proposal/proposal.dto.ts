import { z } from 'zod';

export const createProposalSchema = z.object({
  athleteId: z.string().min(1, 'athleteId é obrigatório'),
  message: z.string().max(500).optional(),
});

export const respondProposalSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED', 'RESCHEDULED']),
  scheduledAt: z.coerce.date().optional(),
}).refine((d) => {
  if (d.status === 'RESCHEDULED' && !d.scheduledAt) return false;
  return true;
}, { message: 'scheduledAt é obrigatório ao remarcar', path: ['scheduledAt'] });

export type CreateProposalDTO = z.infer<typeof createProposalSchema>;
export type RespondProposalDTO = z.infer<typeof respondProposalSchema>;
