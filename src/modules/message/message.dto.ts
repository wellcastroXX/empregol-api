import { z } from 'zod';

export const sendMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type:    z.literal('TEXT'),
    content: z.string().min(1).max(2000),
  }),
  z.object({
    type:     z.literal('AUDIO'),
    audioUrl: z.string().url('URL do áudio inválida'),
  }),
  z.object({
    type:       z.literal('INVITE_CARD'),
    proposalId: z.string().min(1),
  }),
]);

export type SendMessageDTO = z.infer<typeof sendMessageSchema>;
