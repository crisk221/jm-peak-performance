#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface IngredientRow {
  name: string;
  kcal_per_100: number;
  protein_per_100: number;
  carbs_per_100: number;
  fat_per_100: number;
  allergens: string[];
}

interface ImportStats {
  inserted: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; reason: string; data: any }>;
}

function parseAllergens(allergenStr: string): string[] {
  if (!allergenStr || allergenStr.trim() === '') return [];
  return allergenStr
    .split(',')
    .map(a => a.trim())
    .filter(a => a.length > 0)
    .filter((value, index, self) => self.indexOf(value) === index); // dedupe
}

function parseNumeric(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  const num = typeof value === 'string' ? parseFloat(value.trim()) : Number(value);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100; // round to 2 decimal places
}

function validateRow(row: any, rowIndex: number): { valid: boolean; ingredient?: IngredientRow; error?: string } {
  const name = row.name?.toString().trim();
  
  if (!name) {
    return { valid: false, error: 'Missing or empty name' };
  }

  const kcal = parseNumeric(row.kcal_per_100);
  const protein = parseNumeric(row.protein_per_100);
  const carbs = parseNumeric(row.carbs_per_100);
  const fat = parseNumeric(row.fat_per_100);

  // Basic validation - macros shouldn't be negative
  if (kcal < 0 || protein < 0 || carbs < 0 || fat < 0) {
    return { valid: false, error: 'Negative values not allowed for macros' };
  }

  const allergens = parseAllergens(row.allergens?.toString() || '');

  return {
    valid: true,
    ingredient: {
      name,
      kcal_per_100: kcal,
      protein_per_100: protein,
      carbs_per_100: carbs,
      fat_per_100: fat,
      allergens
    }
  };
}

function parseCSV(filePath: string): any[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || '';
    });
    
    rows.push(row);
  }
  
  return rows;
}

function parseXLSX(filePath: string): any[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
  
  // Convert headers to lowercase for consistency
  return jsonData.map(row => {
    const normalizedRow: any = {};
    if (row && typeof row === 'object') {
      Object.keys(row as Record<string, any>).forEach(key => {
        normalizedRow[key.toLowerCase().trim()] = (row as any)[key];
      });
    }
    return normalizedRow;
  });
}

async function upsertIngredient(ingredient: IngredientRow): Promise<'inserted' | 'updated'> {
  const existing = await prisma.ingredient.findUnique({
    where: { name: ingredient.name }
  });
  
  const data = {
    name: ingredient.name,
    kcalPer100g: ingredient.kcal_per_100,
    proteinPer100g: ingredient.protein_per_100,
    carbsPer100g: ingredient.carbs_per_100,
    fatPer100g: ingredient.fat_per_100,
    allergens: JSON.stringify(ingredient.allergens)
  };

  if (existing) {
    await prisma.ingredient.update({
      where: { id: existing.id },
      data
    });
    return 'updated';
  } else {
    await prisma.ingredient.create({ data });
    return 'inserted';
  }
}

async function processInBatches<T>(
  items: T[],
  batchSize: number,
  processor: (item: T, index: number) => Promise<any>
): Promise<any[]> {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map((item, batchIndex) => 
      processor(item, i + batchIndex)
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
}

async function importIngredients(filePath: string, dryRun: boolean = false): Promise<ImportStats> {
  const stats: ImportStats = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: []
  };

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const ext = path.extname(filePath).toLowerCase();
  let rows: any[] = [];

  try {
    if (ext === '.csv') {
      rows = parseCSV(filePath);
    } else if (ext === '.xlsx') {
      rows = parseXLSX(filePath);
    } else {
      throw new Error(`Unsupported file extension: ${ext}. Only .csv and .xlsx are supported.`);
    }
  } catch (error) {
    throw new Error(`Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log(`📁 Processing ${rows.length} rows from ${path.basename(filePath)}`);
  if (dryRun) {
    console.log('🔍 DRY RUN - No changes will be made to the database');
  }

  // Validate all rows first
  const validatedRows = rows.map((row, index) => ({
    ...validateRow(row, index),
    originalIndex: index
  }));

  // Process valid rows in batches
  const validRows = validatedRows.filter(r => r.valid);
  const invalidRows = validatedRows.filter(r => !r.valid);

  // Log invalid rows
  invalidRows.forEach(({ error, originalIndex }) => {
    stats.errors.push({
      row: originalIndex + 1,
      reason: error || 'Unknown validation error',
      data: rows[originalIndex]
    });
    stats.skipped++;
  });

  if (!dryRun && validRows.length > 0) {
    const results = await processInBatches(
      validRows,
      10, // batch size
      async (validatedRow) => {
        try {
          const result = await upsertIngredient(validatedRow.ingredient!);
          return { success: true, action: result };
        } catch (error) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error',
            ingredient: validatedRow.ingredient
          };
        }
      }
    );

    // Process results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { success, action, error } = result.value;
        if (success) {
          if (action === 'inserted') stats.inserted++;
          else if (action === 'updated') stats.updated++;
        } else {
          stats.errors.push({
            row: validRows[index].originalIndex + 1,
            reason: error || 'Database operation failed',
            data: validRows[index].ingredient
          });
          stats.skipped++;
        }
      } else {
        stats.errors.push({
          row: validRows[index].originalIndex + 1,
          reason: result.reason,
          data: validRows[index].ingredient
        });
        stats.skipped++;
      }
    });
  } else if (dryRun) {
    // For dry run, just count what would be inserted/updated
    for (const validRow of validRows) {
      try {
        const existing = await prisma.ingredient.findUnique({
          where: { name: validRow.ingredient!.name }
        });
        if (existing) {
          stats.updated++;
        } else {
          stats.inserted++;
        }
      } catch (error) {
        stats.errors.push({
          row: validRow.originalIndex + 1,
          reason: error instanceof Error ? error.message : 'Database query failed',
          data: validRow.ingredient
        });
        stats.skipped++;
      }
    }
  }

  return stats;
}

function printSummary(stats: ImportStats, dryRun: boolean = false) {
  console.log('\n📊 Import Summary:');
  console.log('┌─────────────┬───────┐');
  console.log('│ Status      │ Count │');
  console.log('├─────────────┼───────┤');
  console.log(`│ Inserted    │ ${stats.inserted.toString().padStart(5)} │`);
  console.log(`│ Updated     │ ${stats.updated.toString().padStart(5)} │`);
  console.log(`│ Skipped     │ ${stats.skipped.toString().padStart(5)} │`);
  console.log('└─────────────┴───────┘');

  if (stats.errors.length > 0) {
    console.log(`\n❌ ${stats.errors.length} errors encountered:`);
    stats.errors.forEach(({ row, reason, data }) => {
      console.log(`   Row ${row}: ${reason}`);
      if (data?.name) {
        console.log(`     Name: "${data.name}"`);
      }
    });
  }

  if (dryRun) {
    console.log('\n💡 This was a dry run. Use the script without --dry-run to apply changes.');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const filePath = args.find(arg => !arg.startsWith('--'));

  if (!filePath) {
    console.error('❌ Error: Please provide a file path');
    console.log('📖 Usage: pnpm import:ingredients <file.csv|file.xlsx> [--dry-run]');
    console.log('📖 Example: pnpm import:ingredients ./data/ingredients.sample.csv');
    process.exit(1);
  }

  try {
    console.log('🚀 Starting ingredient import...');
    const stats = await importIngredients(filePath, dryRun);
    printSummary(stats, dryRun);
    
    if (stats.inserted > 0 || stats.updated > 0) {
      console.log('✅ Import completed successfully!');
    } else if (stats.skipped > 0 && stats.inserted === 0 && stats.updated === 0) {
      console.log('⚠️  No ingredients were imported due to validation errors.');
    }
  } catch (error) {
    console.error('❌ Import failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
