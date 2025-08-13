import * as XLSX from 'xlsx';

// Header normalization utilities
export const normalizeHeader = (s: unknown): string =>
  String(s ?? "")
    .trim()
    .replace(/[\s_-]+/g, "_")
    .toLowerCase();

export const unique = <T,>(arr: T[]): T[] => Array.from(new Set(arr));

export interface RawIngredientRow {
  [key: string]: any;
}

export interface NormalizedIngredientRow {
  name: string;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  allergens: string[];
  action: 'insert' | 'update' | 'skip';
  issue?: string;
  originalName?: string;
}

export interface ColumnMapping {
  [expectedColumn: string]: string | null;
}

export interface ImportPreview {
  rows: NormalizedIngredientRow[];
  detectedHeaders: string[];
  suggestedMapping: ColumnMapping;
  totalRows: number;
  countsByAction: {
    insert: number;
    update: number;
    skip: number;
  };
}

export interface ImportResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}

// Expected column names (normalized)
export const EXPECTED_COLUMNS = {
  name: 'name',
  kcalPer100g: 'kcal_per_100',
  proteinPer100g: 'protein_per_100',
  carbsPer100g: 'carbs_per_100',
  fatPer100g: 'fat_per_100',
  allergens: 'allergens',
} as const;

// Column variations that should map to expected columns
const COLUMN_VARIATIONS: Record<string, string[]> = {
  name: ['name', 'ingredient', 'ingredient_name', 'product', 'title'],
  kcal_per_100: ['kcal_per_100', 'kcal_per_100g', 'calories_per_100', 'calories_per_100g', 'energy_per_100', 'kcal', 'calories', 'energy'],
  protein_per_100: ['protein_per_100', 'protein_per_100g', 'protein', 'prot'],
  carbs_per_100: ['carbs_per_100', 'carbs_per_100g', 'carbohydrates_per_100', 'carbohydrates_per_100g', 'carbs', 'carbohydrates', 'carb'],
  fat_per_100: ['fat_per_100', 'fat_per_100g', 'fats_per_100', 'fats_per_100g', 'fat', 'fats', 'lipids'],
  allergens: ['allergens', 'allergen', 'allergies', 'allergy', 'contains', 'may_contain'],
};

export function suggestColumnMapping(detectedHeaders: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  
  // detectedHeaders are already normalized from parseFileBuffer
  const normalizedDetected = detectedHeaders.map(normalizeHeader);

  Object.entries(EXPECTED_COLUMNS).forEach(([key, expectedCol]) => {
    const variations = COLUMN_VARIATIONS[expectedCol] || [expectedCol];
    
    // Find best match
    for (const variation of variations) {
      const normalizedVariation = normalizeHeader(variation);
      const matchIndex = normalizedDetected.findIndex(h => h === normalizedVariation);
      
      if (matchIndex !== -1) {
        mapping[key] = detectedHeaders[matchIndex];
        break;
      }
    }
    
    if (!mapping[key]) {
      mapping[key] = null;
    }
  });

  return mapping;
}

export function parseFileBuffer(buffer: Buffer, filename: string): RawIngredientRow[] {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('No sheets found in file');
    }
    
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];
    
    if (rows.length < 2) {
      throw new Error('File must contain at least a header row and one data row');
    }
    
    // Normalize and filter headers early
    const rawHeaders = rows[0].map((h: any) => String(h || '').trim());
    const headers = rawHeaders
      .map(normalizeHeader)
      .filter(h => h.length > 0); // Drop blank headers
    
    if (headers.length === 0) {
      throw new Error('No valid headers found in file');
    }
    
    const dataRows = rows.slice(1);
    
    return dataRows.map(row => {
      const obj: RawIngredientRow = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    }).filter(row => Object.values(row).some(val => String(val).trim())); // Remove empty rows
    
  } catch (error) {
    throw new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function coerceNumber(value: any): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  const num = Number(String(value).replace(/[^\d.-]/g, ''));
  if (isNaN(num)) {
    return 0;
  }
  
  return Math.max(0, Math.round(num * 100) / 100); // Round to 2 decimal places and ensure >= 0
}

export function parseAllergens(value: any): string[] {
  if (!value) return [];
  
  const allergenStr = String(value).trim();
  if (!allergenStr) return [];
  
  return allergenStr
    .split(/[,;]/)
    .map(a => a.trim())
    .filter(a => a.length > 0)
    .reduce((unique: string[], allergen) => {
      const lower = allergen.toLowerCase();
      if (!unique.some(u => u.toLowerCase() === lower)) {
        unique.push(allergen);
      }
      return unique;
    }, []);
}

export function normalizeIngredientName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .toLowerCase();
}

export async function normalizeRows(
  rawRows: RawIngredientRow[],
  mapping: ColumnMapping,
  existingIngredients: Array<{ name: string }> = []
): Promise<NormalizedIngredientRow[]> {
  const existingNamesSet = new Set(
    existingIngredients.map(ing => normalizeIngredientName(ing.name))
  );

  return rawRows.map(row => {
    const name = String(row[mapping.name || ''] || '').trim();
    const originalName = name;
    
    if (!name) {
      return {
        name: '',
        kcalPer100g: 0,
        proteinPer100g: 0,
        carbsPer100g: 0,
        fatPer100g: 0,
        allergens: [],
        action: 'skip' as const,
        issue: 'Missing name',
        originalName,
      };
    }
    
    const kcalPer100g = coerceNumber(row[mapping.kcalPer100g || '']);
    const proteinPer100g = coerceNumber(row[mapping.proteinPer100g || '']);
    const carbsPer100g = coerceNumber(row[mapping.carbsPer100g || '']);
    const fatPer100g = coerceNumber(row[mapping.fatPer100g || '']);
    const allergens = parseAllergens(row[mapping.allergens || '']);
    
    if (kcalPer100g === 0 && proteinPer100g === 0 && carbsPer100g === 0 && fatPer100g === 0) {
      return {
        name,
        kcalPer100g,
        proteinPer100g,
        carbsPer100g,
        fatPer100g,
        allergens,
        action: 'skip' as const,
        issue: 'All nutrition values are zero',
        originalName,
      };
    }
    
    const normalizedName = normalizeIngredientName(name);
    const exists = existingNamesSet.has(normalizedName);
    
    return {
      name,
      kcalPer100g,
      proteinPer100g,
      carbsPer100g,
      fatPer100g,
      allergens,
      action: exists ? 'update' as const : 'insert' as const,
      originalName,
    };
  });
}

export function calculateActionCounts(rows: NormalizedIngredientRow[]) {
  return rows.reduce(
    (counts, row) => {
      counts[row.action]++;
      return counts;
    },
    { insert: 0, update: 0, skip: 0 }
  );
}
