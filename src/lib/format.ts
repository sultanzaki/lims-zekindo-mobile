// Ported from the web app's src/lib/format.ts (relativeTime, dueLabelFor) —
// same logic, kept in parallel since the repos can't share code.

export function relativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

export function dueLabelFor(receivedDate: Date | string, targetTatHours: number): { label: string; color: string } {
  const received = typeof receivedDate === 'string' ? new Date(receivedDate) : receivedDate;
  const dueAt = received.getTime() + targetTatHours * 60 * 60 * 1000;
  const hoursLeft = (dueAt - Date.now()) / (60 * 60 * 1000);
  if (hoursLeft <= 0) return { label: 'Overdue', color: '#D0021B' };
  if (hoursLeft < 1) return { label: 'Due <1h', color: '#F5A623' };
  if (hoursLeft < 24) return { label: `Due in ${Math.round(hoursLeft)}h`, color: '#F5A623' };
  return { label: `Due in ${Math.round(hoursLeft / 24)}d`, color: '#7A8B94' };
}
