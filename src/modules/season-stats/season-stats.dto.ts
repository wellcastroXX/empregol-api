import { z } from 'zod';
import { FootPreference } from '@prisma/client';

export const upsertSeasonStatsSchema = z.object({
  year:          z.number().int().min(2000).max(2100),
  goals:         z.number().int().min(0),
  assists:       z.number().int().min(0),
  gamesPlayed:   z.number().int().min(0),
  minutesPlayed: z.number().int().min(0),
  position:      z.string().min(2),
  height:        z.number().min(1).max(2.5),
  weight:        z.number().min(30).max(200),
  dominantFoot:  z.nativeEnum(FootPreference),
  lastClub:      z.string().optional().nullable(),
});

export type UpsertSeasonStatsDTO = z.infer<typeof upsertSeasonStatsSchema>;
