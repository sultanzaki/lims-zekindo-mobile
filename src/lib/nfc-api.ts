import { apiFetch } from '@/lib/api-client';

export function resolveNfcTag(token: string) {
  return apiFetch<{ ok: true; sampleId: string }>('/api/mobile/nfc/resolve', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}
