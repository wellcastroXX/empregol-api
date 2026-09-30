/** Envio de push pela API do Expo (https://exp.host/--/api/v2/push/send). */

export type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default';
  channelId?: string;
};

/** Um Expo push token válido tem o formato ExponentPushToken[...] / ExpoPushToken[...]. */
export function isExpoPushToken(token: string): boolean {
  return /^Expo(nent)?PushToken\[.+\]$/.test(token);
}

/** Envia em lotes de 100 (limite do Expo). Nunca lança — só loga. */
export async function sendExpoPush(messages: ExpoPushMessage[]): Promise<void> {
  const valid = messages.filter((m) => isExpoPushToken(m.to));
  for (let i = 0; i < valid.length; i += 100) {
    const batch = valid.slice(i, i + 100);
    try {
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });
      if (!res.ok) {
        console.warn('[push] Expo respondeu', res.status, await res.text().catch(() => ''));
      }
    } catch (err) {
      console.warn('[push] falha ao enviar lote:', (err as Error).message);
    }
  }
}
