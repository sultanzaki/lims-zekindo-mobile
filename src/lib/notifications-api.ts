import { apiFetch } from '@/lib/api-client';

export type NotificationRow = {
  id: string;
  title: string;
  body: string;
  sampleId: string | null;
  unread: boolean;
  createdAt: string;
};

export function fetchNotifications() {
  return apiFetch<{ ok: true; notifications: NotificationRow[] }>('/api/mobile/notifications');
}

export function markAllNotificationsRead() {
  return apiFetch<{ ok: true }>('/api/mobile/notifications/read-all', { method: 'POST' });
}
