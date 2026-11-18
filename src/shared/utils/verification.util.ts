/**
 * Selo verificado.
 *
 * Regra de produto: o selo é **automático** — aparece quando o perfil está
 * completo — e a administração pode vetá-lo (`verificationBlocked`).
 *
 * Por isso o booleano não é persistido: ele é derivado na leitura. Guardá-lo
 * exigiria recalcular a cada escrita em qualquer campo que entra na conta, e
 * um deles (estatísticas de temporada) mora em outra tabela.
 *
 * `missing` sai junto para o app montar o "complete seu perfil" sem precisar
 * reimplementar esta regra no cliente.
 */

export interface VerificationResult {
  /** Selo a exibir: perfil completo **e** sem veto da adm. */
  verified: boolean;
  /** Completude isolada, ignorando o veto. */
  complete: boolean;
  /** Chaves pendentes, na ordem em que valem ser pedidas ao usuário. */
  missing: string[];
}

/** Campos que o atleta precisa preencher para o perfil contar como completo. */
export interface AthleteVerificationInput {
  avatarUrl?: string | null;
  city?: string | null;
  state?: string | null;
  expectedSalary?: unknown; // Prisma.Decimal | number | null
  /** Quantidade de temporadas cadastradas (ou a própria lista). */
  seasonStatsCount?: number;
  verificationBlocked?: boolean;
}

const filled = (value?: string | null): boolean =>
  typeof value === 'string' && value.trim().length > 0;

/** Decimal do Prisma, number ou string — todos chegam aqui. */
const positive = (value: unknown): boolean => {
  if (value == null) return false;
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
};

export function athleteVerification(a: AthleteVerificationInput): VerificationResult {
  const missing: string[] = [];

  // Os campos obrigatórios do cadastro (nome, cpf, nascimento, posição,
  // altura, peso…) não entram aqui: o schema já os garante não-nulos. O que
  // sobra é justamente o que o atleta pode deixar em branco.
  if (!filled(a.avatarUrl)) missing.push('avatarUrl');
  if (!filled(a.city)) missing.push('city');
  if (!filled(a.state)) missing.push('state');
  if (!positive(a.expectedSalary)) missing.push('expectedSalary');
  if (!(a.seasonStatsCount && a.seasonStatsCount > 0)) missing.push('seasonStats');

  const complete = missing.length === 0;
  return { verified: complete && !a.verificationBlocked, complete, missing };
}

/** Campos equivalentes para clube/agência. */
export interface ContractorVerificationInput {
  avatarUrl?: string | null;
  cnpj?: string | null;
  cpf?: string | null;
  companyName?: string | null;
  verificationBlocked?: boolean;
}

export function contractorVerification(
  c: ContractorVerificationInput,
): VerificationResult {
  const missing: string[] = [];

  // Logo/escudo é o que dá cara ao perfil na busca.
  if (!filled(c.avatarUrl)) missing.push('avatarUrl');
  // Documento: agência pessoa física usa CPF, clube usa CNPJ — um dos dois basta.
  if (!filled(c.cnpj) && !filled(c.cpf)) missing.push('documento');
  if (!filled(c.companyName)) missing.push('companyName');

  const complete = missing.length === 0;
  return { verified: complete && !c.verificationBlocked, complete, missing };
}
