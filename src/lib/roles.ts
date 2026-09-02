// Kept in parallel with src/lib/roles.ts in the web repo (can't literally
// share code across the two repos) — same accessRole tiers, same rules.
export const ROLE_LABELS: Record<string, string> = {
  TECHNICIAN: 'Technician',
  SUPERVISOR: 'Supervisor',
  QA_MANAGER: 'QA Manager',
  ADMIN: 'Lab Manager (Admin)',
};

export function canReviewAsSupervisor(role: string) {
  return role === 'SUPERVISOR' || role === 'ADMIN';
}

export function canApproveAsQa(role: string) {
  return role === 'QA_MANAGER' || role === 'ADMIN';
}
