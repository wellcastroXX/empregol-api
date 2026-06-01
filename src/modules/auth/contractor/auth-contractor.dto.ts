import { z } from 'zod';
import { ContractorType } from '@prisma/client';

const cpfRegex = /^\d{11}$/;
const cnpjRegex = /^\d{14}$/;

export const registerContractorSchema = z
  .object({
    type: z.nativeEnum(ContractorType),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    phone: z.string().min(10, 'Telefone inválido'),
    cpf: z.string().regex(cpfRegex, 'CPF deve conter 11 dígitos').optional(),
    cnpj: z.string().regex(cnpjRegex, 'CNPJ deve conter 14 dígitos').optional(),
    companyName: z.string().optional(),
    socialMedia: z.string().url('URL de rede social inválida').optional(),
    additionalInfo: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'AGENT' && !data.cpf) {
      ctx.addIssue({ code: 'custom', path: ['cpf'], message: 'CPF é obrigatório para agentes' });
    }
    if (data.type === 'CLUB' && !data.cnpj) {
      ctx.addIssue({ code: 'custom', path: ['cnpj'], message: 'CNPJ é obrigatório para clubes' });
    }
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export const resendCodeSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export type RegisterContractorDTO = z.infer<typeof registerContractorSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type VerifyEmailDTO = z.infer<typeof verifyEmailSchema>;
export type ResendCodeDTO = z.infer<typeof resendCodeSchema>;
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
