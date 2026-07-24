export function parsePrice(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null;
  const normalized = value.replace(",", ".").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const num = Number(normalized);
  if (!Number.isFinite(num) || num <= 0 || num > 100000) return null;
  return num;
}

export function parseText(
  value: FormDataEntryValue | null,
  { min = 2, max = 200 }: { min?: number; max?: number } = {}
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) return null;
  return trimmed;
}
