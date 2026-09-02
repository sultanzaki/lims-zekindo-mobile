import { useQuery } from '@tanstack/react-query';

import { fetchSamples } from '@/lib/samples-api';

export function useSamples(params: { status?: string; q?: string }) {
  return useQuery({
    queryKey: ['samples', params.status ?? 'All', params.q ?? ''],
    queryFn: () => fetchSamples(params.status && params.status !== 'All' ? params : { q: params.q }),
  });
}
