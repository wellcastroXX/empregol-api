/** Geração de slug para a vitrine pública do atleta (empregol.co/p/<slug>). */

/** "Wellington Castro" -> "wellington-castro". */
export function slugify(value: string): string {
  return (
    value
      .normalize('NFD')
      // Tira os acentos que o NFD separou das letras (\p{M} = marcas combinantes).
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
  );
}

/**
 * Primeiro slug livre a partir do nome.
 *
 * Dois "Wellington Castro" não podem disputar a mesma URL, então o segundo
 * vira `wellington-castro-2`. `isTaken` consulta o banco.
 */
export async function uniqueSlug(
  fullName: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(fullName) || 'atleta';

  if (!(await isTaken(base))) return base;

  // Limite para não varrer o banco indefinidamente num nome muito comum.
  for (let suffix = 2; suffix <= 50; suffix++) {
    const candidate = `${base}-${suffix}`;
    if (!(await isTaken(candidate))) return candidate;
  }

  // Saída garantida: sufixo aleatório curto.
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Idade em anos completos. Menor de 18 não pode abrir a vitrine. */
export function ageFrom(birthDate: Date): number {
  const today = new Date();
  const years = today.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  return beforeBirthday ? years - 1 : years;
}
