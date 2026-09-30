import { ENGAGEMENT_RULES, VARIABLE_FALLBACKS, type Audience } from './message-bank';

const TZ = 'America/Sao_Paulo';
const WD: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Hora (0-23) e dia da semana (0=domingo) no fuso de Brasília. */
export function nowBrt(d = new Date()): { hour: number; weekday: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hour: '2-digit',
    hour12: false,
    weekday: 'short',
  }).formatToParts(d);
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0') % 24;
  const weekday = WD[parts.find((p) => p.type === 'weekday')?.value ?? 'Sun'] ?? 0;
  return { hour, weekday };
}

/** Silêncio 22h–8h (BRT). */
export function isQuietHour(d = new Date()): boolean {
  const { hour } = nowBrt(d);
  const { startHour, endHour } = ENGAGEMENT_RULES.quietHours;
  return hour >= startHour || hour < endHour;
}

/** Janela de envio por papel. */
export function inSendWindow(audience: Audience, d = new Date()): boolean {
  const { hour, weekday } = nowBrt(d);
  const isWeekend = weekday === 0 || weekday === 6;
  const w = ENGAGEMENT_RULES.sendWindows[audience];
  if (isWeekend) return w.weekendAllDay;
  return w.weekdays.some(([start, end]) => hour >= start && hour < end);
}

type Vars = Record<string, string | number | undefined | null>;

/** Há alguma variável do texto sem valor real (vazia/indefinida)? */
export function hasEmptyVar(text: string, vars: Vars): boolean {
  const keys = [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
  return keys.some((k) => {
    const v = vars[k];
    return v === undefined || v === null || String(v).trim() === '';
  });
}

/**
 * Substitui {variaveis}. Usa o fallback quando vazio; se o fallback for null
 * (contagem 0 / obrigatória), sinaliza `skip` (não enviar).
 */
export function renderTemplate(text: string, vars: Vars): { text: string; skip: boolean } {
  let skip = false;
  const out = text
    .replace(/\{(\w+)\}/g, (_, key: string) => {
      const v = vars[key];
      if (v !== undefined && v !== null && String(v).trim() !== '') return String(v);
      const fb = VARIABLE_FALLBACKS[key];
      if (fb === null) {
        skip = true;
        return '';
      }
      return fb ?? '';
    })
    .replace(/\s{2,}/g, ' ')
    .trim();
  return { text: out, skip };
}
