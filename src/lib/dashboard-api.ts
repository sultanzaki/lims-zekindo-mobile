import { apiFetch } from '@/lib/api-client';

export type AttentionItem = {
  id: string;
  tag: 'REJECTED' | 'OVERDUE';
  title: string;
  body: string;
};

export type QueueSample = {
  id: string;
  name: string | null;
  type: string;
  source: string;
  status: string;
  dotColor: string;
  statusShort: string;
  dueLabel: string;
  dueColor: string;
};

export type DashboardResponse = {
  ok: true;
  role: string;
  unreadCount: number;
  pendingLogin: number;
  inTesting: number;
  awaitingReview: number;
  overdueCount: number;
  attentionItems: AttentionItem[];
  queueSamples: QueueSample[];
  approvedLast7: number;
  rejectedLast7: number;
  passRate: number | null;
};

export function fetchDashboard() {
  return apiFetch<DashboardResponse>('/api/mobile/dashboard');
}
