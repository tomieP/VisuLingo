/**
 * Normalize a raw object detection label.
 * - Lowercase
 * - Trim whitespace
 * - Replace hyphens/underscores with spaces
 * - Collapse multiple spaces
 */
export function normalizeLabel(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';

  return raw
    .toLowerCase()
    .trim()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Normalize and singularize a label for database lookup.
 * Adds common pluralization handling.
 */
export function normalizeForLookup(raw: string): string {
  const normalized = normalizeLabel(raw);
  // Handle common plurals → singular
  return normalized
    .replace(/(oes|ses|xes)$/, '')
    .replace(/ies$/, 'y')
    .replace(/s$/, '');
}