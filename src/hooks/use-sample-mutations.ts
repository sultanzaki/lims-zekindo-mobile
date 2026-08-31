import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addTestReading, deleteTestReading, submitTestResult } from '@/lib/samples-api';

export function useAddTestReading(sampleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      testId,
      ...input
    }: {
      testId: string;
      value: string;
      intervalLabel?: string | null;
      replicateIndex?: number | null;
      note?: string | null;
    }) => addTestReading(sampleId, testId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sample', sampleId] }),
  });
}

export function useDeleteTestReading(sampleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ testId, readingId }: { testId: string; readingId: string }) =>
      deleteTestReading(sampleId, testId, readingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sample', sampleId] }),
  });
}

export function useSubmitTestResult(sampleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ testId, result, notes }: { testId: string; result: string; notes?: string }) =>
      submitTestResult(sampleId, testId, { result, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sample', sampleId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
