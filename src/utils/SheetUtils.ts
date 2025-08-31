export function normalizeString(value?: string): string {
  return (value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function parseIntSafe(value?: string, fallback = 0): number {
  const n = parseInt(value as string, 10);
  return Number.isFinite(n) ? n : fallback;
}
