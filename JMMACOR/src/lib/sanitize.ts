/**
 * Sanitizes array of strings by trimming, deduplicating (case-insensitive), and removing empty values
 */
export function sanitizeStringArray(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  
  for (const item of items) {
    const trimmed = item.trim();
    if (trimmed && !seen.has(trimmed.toLowerCase())) {
      seen.add(trimmed.toLowerCase());
      result.push(trimmed);
    }
  }
  
  return result;
}

/**
 * Trims a string and returns empty string if only whitespace
 */
export function sanitizeString(str: string): string {
  return str.trim();
}
