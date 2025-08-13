export const toJson = (arr: string[] | undefined | null) => JSON.stringify(arr ?? []);

export const fromJsonArray = (s: string | null | undefined): string[] => {
  if (!s) return [];
  try { 
    const v = JSON.parse(s); 
    return Array.isArray(v) ? v.filter(Boolean) : []; 
  } catch { 
    return []; 
  }
};
