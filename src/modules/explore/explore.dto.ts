import { z } from 'zod';
import { AvailabilityStatus, AgencyStatus, AthleteLevel, ContractorType, FootPreference, Gender } from '@prisma/client';

const POSITIONS = ['GOL','ZAG','LAD','LAE','VOL','MC','ME','MD','MCO','ALA','ATA','PD','PE','CA','SA','ST'] as const;

const SORT_FIELDS = ['createdAt','fullName','goals','assists','minutesPlayed','height','weight','expectedSalary'] as const;

const commaSeparated = (schema: z.ZodType) =>
  z.string().transform((v) => v.split(',').map((s) => s.trim())).pipe(z.array(schema));

export const exploreQuerySchema = z.object({
  // ── Texto livre ──────────────────────────────────────────────────────────────
  q: z.string().max(100).optional(),

  // ── Perfil esportivo ─────────────────────────────────────────────────────────
  positions:     commaSeparated(z.enum(POSITIONS)).optional(),
  level:         z.nativeEnum(AthleteLevel).optional(),
  dominantFoot:  z.nativeEnum(FootPreference).optional(),

  // ── Status ───────────────────────────────────────────────────────────────────
  availability:  z.nativeEnum(AvailabilityStatus).optional(),
  agencyStatus:  z.nativeEnum(AgencyStatus).optional(),
  gender:        z.nativeEnum(Gender).optional(),

  // ── Faixa etária (calcula birthDate internamente) ────────────────────────────
  ageMin:  z.coerce.number().int().min(14).max(60).optional(),
  ageMax:  z.coerce.number().int().min(14).max(60).optional(),

  // ── Dados físicos ────────────────────────────────────────────────────────────
  heightMin: z.coerce.number().min(1).max(2.5).optional(),   // metros (1.75)
  heightMax: z.coerce.number().min(1).max(2.5).optional(),
  weightMin: z.coerce.number().min(30).max(200).optional(),
  weightMax: z.coerce.number().min(30).max(200).optional(),

  // ── Localização ──────────────────────────────────────────────────────────────
  state: z.string().length(2).toUpperCase().optional(),

  // ── Financeiro ───────────────────────────────────────────────────────────────
  salaryMin: z.coerce.number().positive().optional(),
  salaryMax: z.coerce.number().positive().optional(),

  // ── Estatísticas (denormalizadas) ────────────────────────────────────────────
  goalsMin:         z.coerce.number().int().min(0).optional(),
  assistsMin:       z.coerce.number().int().min(0).optional(),
  minutesPlayedMin: z.coerce.number().int().min(0).optional(),

  // ── Ordenação ────────────────────────────────────────────────────────────────
  orderBy:  z.enum(SORT_FIELDS).default('createdAt'),
  orderDir: z.enum(['asc', 'desc']).default('desc'),

  // ── Paginação ────────────────────────────────────────────────────────────────
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ExploreQueryDTO = z.infer<typeof exploreQuerySchema>;

/** Busca de contratantes (clubes/agentes) — "Mercado" do atleta. */
export const contractorQuerySchema = z.object({
  q:     z.string().max(100).optional(),
  type:  z.nativeEnum(ContractorType).optional(),
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ContractorQueryDTO = z.infer<typeof contractorQuerySchema>;
