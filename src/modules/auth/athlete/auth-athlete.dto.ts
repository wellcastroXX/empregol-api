import { z } from 'zod';
import { FootPreference, AthleteLevel } from '@prisma/client';

const cpfRegex = /^\d{11}$/;

export const registerAthleteSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  fullName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().regex(cpfRegex, 'CPF deve conter 11 dígitos numéricos'),
  birthDate: z.coerce.date({ invalid_type_error: 'Data de nascimento inválida' }),
  phone: z.string().min(10, 'Telefone inválido'),
  naturalidade: z.string().min(2, 'Naturalidade inválida'),
  position: z.string().min(2, 'Posição inválida'),
  dominantFoot: z.nativeEnum(FootPreference),
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(200),
  level: z.nativeEnum(AthleteLevel),
  expectedSalary: z.number().positive().optional(),
  videoUrl: z.string().url('URL de vídeo inválida').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Código deve ter 6 dígitos'),
});

export const resendCodeSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
});

export type RegisterAthleteDTO = z.infer<typeof registerAthleteSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type VerifyEmailDTO = z.infer<typeof verifyEmailSchema>;
export type ResendCodeDTO = z.infer<typeof resendCodeSchema>;
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
