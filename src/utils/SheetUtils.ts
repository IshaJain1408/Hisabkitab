// utils/SheetUtils.ts
/**
 * Normalizes product / name strings for comparisons.
 */
export function normalizeString(value?: string): string {
  return (value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Safely parse integer with fallback.
 */
export function parseIntSafe(value?: string, fallback = 0): number {
  const n = parseInt(value as string, 10);
  return Number.isFinite(n) ? n : fallback;
}
