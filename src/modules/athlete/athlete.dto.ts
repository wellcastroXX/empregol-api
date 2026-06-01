import { z } from 'zod';
import { FootPreference, AthleteLevel, AvailabilityStatus, AgencyStatus } from '@prisma/client';

export const updateAthleteSchema = z.object({
  // Identidade
  fullName:       z.string().min(3).optional(),
  naturalidade:   z.string().min(2).optional(),
  phone:          z.string().min(10).optional(),
  city:           z.string().optional().nullable(),
  state:          z.string().length(2, 'Use a sigla do estado (ex: SP)').optional().nullable(),

  // Vitrine
  jerseyNumber:   z.number().int().min(1).max(99).optional().nullable(),
  avatarUrl:      z.string().url().optional().nullable(),

  // Perfil esportivo
  position:       z.string().min(2).optional(),
  dominantFoot:   z.nativeEnum(FootPreference).optional(),
  height:         z.number().min(1).max(2.5).optional(),
  weight:         z.number().min(30).max(200).optional(),
  level:          z.nativeEnum(AthleteLevel).optional(),

  // Status
  availability:   z.nativeEnum(AvailabilityStatus).optional(),
  agencyStatus:   z.nativeEnum(AgencyStatus).optional(),

  // Pretensão salarial
  expectedSalary: z.number().positive().optional().nullable(),

  // Social
  socialMedia:    z.string().url().optional().nullable(),
  additionalInfo: z.string().max(1000).optional().nullable(),

  // Campos desnormalizados (atualizado via season-stats, mas editável manualmente)
  lastClub:       z.string().optional().nullable(),
  goals:          z.number().int().min(0).optional().nullable(),
  assists:        z.number().int().min(0).optional().nullable(),
  gamesThisSeason:z.number().int().min(0).optional().nullable(),
  minutesPlayed:  z.number().int().min(0).optional().nullable(),
});

export type UpdateAthleteDTO = z.infer<typeof updateAthleteSchema>;
