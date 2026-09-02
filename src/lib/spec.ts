// Ported verbatim from the web app's src/lib/spec.ts — kept in parallel
// since the repos can't share code.

export type SpecVerdict = 'Pass' | 'Fail' | null;

type SpecLimit = { kind: 'lte'; value: number } | { kind: 'gte'; value: number } | { kind: 'exact'; value: string };

export function parseSpecLimit(spec: string): SpecLimit | null {
  const s = spec.trim();
  if (!s) return null;

  let m = s.match(/^[≤<]=?\s*([\d,]+\.?\d*)/);
  if (m) return { kind: 'lte', value: parseFloat(m[1].replace(/,/g, '')) };

  m = s.match(/^[≥>]=?\s*([\d,]+\.?\d*)/);
  if (m) return { kind: 'gte', value: parseFloat(m[1].replace(/,/g, '')) };

  if (!/\d/.test(s) && s.toLowerCase() !== 'per sop') {
    return { kind: 'exact', value: s };
  }

  return null;
}

export function parseSpecVerdict(spec: string | null | undefined, result: string | null | undefined): SpecVerdict {
  if (!spec || !result) return null;
  const limit = parseSpecLimit(spec);
  if (!limit) return null;

  if (limit.kind === 'exact') {
    return result.trim().toLowerCase() === limit.value.trim().toLowerCase() ? 'Pass' : 'Fail';
  }

  const n = parseFloat(String(result).replace(/[^0-9.\-]/g, ''));
  if (Number.isNaN(n)) return null;
  if (limit.kind === 'lte') return n <= limit.value ? 'Pass' : 'Fail';
  return n >= limit.value ? 'Pass' : 'Fail';
}

export function specNumericLimit(spec: string | null | undefined): number | null {
  if (!spec) return null;
  const limit = parseSpecLimit(spec);
  return limit && limit.kind !== 'exact' ? limit.value : null;
}
