import { useQuery } from '@tanstack/react-query';

import { fetchDashboard } from '@/lib/dashboard-api';

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard });
}
