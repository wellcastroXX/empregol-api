import { z } from 'zod';

export const socialLoginSchema = z.object({
  provider: z.enum(['google', 'apple']),
  idToken: z.string().min(10, 'idToken obrigatório'),
});

export type SocialLoginDTO = z.infer<typeof socialLoginSchema>;
