// Kept in parallel with src/lib/roles.ts in the web repo (can't literally
// share code across the two repos) — same accessRole tiers, same rules.
export function canReviewAsSupervisor(role: string) {
  return role === 'SUPERVISOR' || role === 'ADMIN';
}

export function canApproveAsQa(role: string) {
  return role === 'QA_MANAGER' || role === 'ADMIN';
}
