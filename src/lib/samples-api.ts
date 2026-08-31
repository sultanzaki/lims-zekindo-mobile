import { apiFetch } from '@/lib/api-client';

export type SampleListItem = {
  id: string;
  name: string | null;
  type: string;
  source: string;
  status: string;
  priority: string;
  collectedBy: string;
  receivedDate: string;
  sampleType: { targetTatHours: number } | null;
};

export function fetchSamples(params: { status?: string; q?: string } = {}) {
  const search = new URLSearchParams();
  if (params.status) search.set('status', params.status);
  if (params.q) search.set('q', params.q);
  const qs = search.toString();
  return apiFetch<{ ok: true; samples: SampleListItem[] }>(`/api/mobile/samples${qs ? `?${qs}` : ''}`);
}

export type SampleAttachment = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  url: string | null;
};

export type SampleTest = {
  id: string;
  name: string;
  status: string;
  result: string | null;
  unit: string;
  spec: string;
  notes: string | null;
  order: number;
  resultMode: string;
  replicateCount: number | null;
  intervalPlan: string | null;
  attachments: SampleAttachment[];
};

export type CustodyEvent = {
  id: string;
  label: string;
  detail: string | null;
  time: string;
  order: number;
};

export type SampleDetail = {
  id: string;
  name: string | null;
  priority: string;
  type: string;
  source: string;
  status: string;
  collectedBy: string;
  collectedDate: string;
  receivedDate: string;
  container: string;
  storageLocation: string | null;
  tests: SampleTest[];
  custodyEvents: CustodyEvent[];
  reports: SampleAttachment[];
  businessUnit: { id: string; name: string } | null;
  sampleType: { id: string; name: string } | null;
};

export function fetchSampleDetail(id: string) {
  return apiFetch<{ ok: true; sample: SampleDetail }>(`/api/mobile/samples/${encodeURIComponent(id)}`);
}
