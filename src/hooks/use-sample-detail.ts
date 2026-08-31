import { useQuery } from '@tanstack/react-query';

import { fetchSampleDetail } from '@/lib/samples-api';

export function useSampleDetail(id: string) {
  return useQuery({
    queryKey: ['sample', id],
    queryFn: () => fetchSampleDetail(id),
    enabled: !!id,
  });
}
