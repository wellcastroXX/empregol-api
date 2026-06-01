import { z } from 'zod';

export const updateContractorSchema = z.object({
  name: z.string().min(3).optional(),
  phone: z.string().min(10).optional(),
  companyName: z.string().optional().nullable(),
  socialMedia: z.string().url().optional().nullable(),
  additionalInfo: z.string().max(1000).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

export type UpdateContractorDTO = z.infer<typeof updateContractorSchema>;
