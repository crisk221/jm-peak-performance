#!/usr/bin/env tsx

/**
 * Ingredient Import Script
 * 
 * Imports ingredients from /data/ingredients/JMPP_CUSTOM_INGREDIENT_DB.xlsx
 * Maps Excel columns to Ingredient model fields and upserts by normalized name.
 * 
 * Usage: pnpm ingredients:import
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

interface ImportRow {
  name?: string;
  unitBase?: string;
  kcal100?: number;
  protein100?: number;
  carbs100?: number;
  fat100?: number;
  category?: string;
  alias?: string;
}

interface ProcessedIngredient {
  name: string;
  normalizedName: string;
  unitBase: 'GRAM' | 'ML' | 'UNIT';
  kcal100: number;
  protein100: number;
  carbs100: number;
  fat100: number;
  category?: string;
  aliases?: string[];
}

interface ImportStats {
  processed: number;
  skipped: number;
  upserted: number;
  errors: string[];
}

const prisma = new PrismaClient();

/**
 * Normalize ingredient name for consistent matching
 */
function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Parse and validate unit base from Excel value
 */
function parseUnitBase(value?: string): 'GRAM' | 'ML' | 'UNIT' {
  if (!value) return 'GRAM';
  
  const normalized = value.trim().toUpperCase();
  switch (normalized) {
    case 'GRAM':
    case 'G':
    case 'GRAMS':
      return 'GRAM';
    case 'ML':
    case 'MILLILITER':
    case 'MILLILITERS':
      return 'ML';
    case 'UNIT':
    case 'PIECE':
    case 'PIECES':
      return 'UNIT';
    default:
      return 'GRAM'; // Default fallback
  }
}

/**
 * Parse numeric value from Excel cell
 */
function parseNumber(value: any): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Parse aliases from string (comma-separated)
 */
function parseAliases(value?: string): string[] | undefined {
  if (!value) return undefined;
  return value
    .split(',')
    .map(alias => alias.trim())
    .filter(alias => alias.length > 0);
}

/**
 * Validate that all required macro values are present and valid
 */
function validateMacros(kcal?: number, protein?: number, carbs?: number, fat?: number): boolean {
  return kcal !== undefined && protein !== undefined && carbs !== undefined && fat !== undefined &&
         kcal >= 0 && protein >= 0 && carbs >= 0 && fat >= 0;
}

/**
 * Process a single row from the Excel sheet
 */
function processRow(row: any, rowIndex: number): ProcessedIngredient | string {
  const importRow: ImportRow = {
    name: row['name'] || row['Name'] || row['INGREDIENT'] || row['ingredient'],
    unitBase: row['unitBase'] || row['unit_base'] || row['Unit'] || row['UNIT'],
    kcal100: parseNumber(row['kcal100'] ?? row['calories'] ?? row['CALORIES'] ?? row['kcal']),
    protein100: parseNumber(row['protein100'] ?? row['protein'] ?? row['PROTEIN']),
    carbs100: parseNumber(row['carbs100'] ?? row['carbs'] ?? row['CARBS'] ?? row['carbohydrates']),
    fat100: parseNumber(row['fat100'] ?? row['fat'] ?? row['FAT']),
    category: row['category'] || row['Category'] || row['CATEGORY'],
    alias: row['alias'] || row['aliases'] || row['Alias'] || row['ALIASES'],
  };

  // Validate required fields
  if (!importRow.name) {
    return `Row ${rowIndex + 1}: Missing ingredient name`;
  }

  if (!validateMacros(importRow.kcal100, importRow.protein100, importRow.carbs100, importRow.fat100)) {
    return `Row ${rowIndex + 1}: Missing or invalid macro values for "${importRow.name}"`;
  }

  const aliases = parseAliases(importRow.alias);

  return {
    name: importRow.name.trim(),
    normalizedName: normalizeName(importRow.name),
    unitBase: parseUnitBase(importRow.unitBase),
    kcal100: importRow.kcal100!,
    protein100: importRow.protein100!,
    carbs100: importRow.carbs100!,
    fat100: importRow.fat100!,
    category: importRow.category?.trim() || undefined,
    aliases,
  };
}

/**
 * Upsert ingredient by normalized name
 */
async function upsertIngredient(ingredient: ProcessedIngredient): Promise<void> {
  await prisma.ingredient.upsert({
    where: {
      name: ingredient.name,
    },
    update: {
      unitBase: ingredient.unitBase,
      kcal100: ingredient.kcal100,
      protein100: ingredient.protein100,
      carbs100: ingredient.carbs100,
      fat100: ingredient.fat100,
      category: ingredient.category,
      aliases: ingredient.aliases,
      updatedAt: new Date(),
    },
    create: {
      name: ingredient.name,
      unitBase: ingredient.unitBase,
      kcal100: ingredient.kcal100,
      protein100: ingredient.protein100,
      carbs100: ingredient.carbs100,
      fat100: ingredient.fat100,
      category: ingredient.category,
      aliases: ingredient.aliases,
    },
  });
}

/**
 * Main import function
 */
async function importIngredients(): Promise<void> {
  const stats: ImportStats = {
    processed: 0,
    skipped: 0,
    upserted: 0,
    errors: [],
  };

  try {
    // Read Excel file
    const filePath = resolve(process.cwd(), 'data/ingredients/JMPP_CUSTOM_INGREDIENT_DB.xlsx');
    console.log(`📖 Reading Excel file: ${filePath}`);
    
    const fileBuffer = readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('No sheets found in Excel file');
    }
    
    console.log(`📊 Processing sheet: "${sheetName}"`);
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📝 Found ${rows.length} rows to process`);
    
    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      stats.processed++;
      
      const result = processRow(row, i);
      
      if (typeof result === 'string') {
        // Error message
        stats.errors.push(result);
        stats.skipped++;
        continue;
      }
      
      try {
        await upsertIngredient(result);
        stats.upserted++;
        
        if (stats.upserted % 50 === 0) {
          console.log(`⏳ Processed ${stats.upserted} ingredients...`);
        }
      } catch (error) {
        const errorMsg = `Row ${i + 1}: Failed to upsert "${result.name}" - ${error instanceof Error ? error.message : 'Unknown error'}`;
        stats.errors.push(errorMsg);
        stats.skipped++;
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to read Excel file:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }

  // Print summary
  console.log('\n📋 Import Summary:');
  console.log(`✅ Total processed: ${stats.processed}`);
  console.log(`🔄 Successfully upserted: ${stats.upserted}`);
  console.log(`⚠️  Skipped: ${stats.skipped}`);
  
  if (stats.errors.length > 0) {
    console.log(`\n❌ Errors (${stats.errors.length}):`);
    stats.errors.forEach(error => console.log(`   ${error}`));
  }
  
  if (stats.upserted > 0) {
    console.log(`\n🎉 Successfully imported ${stats.upserted} ingredients!`);
  }
}

// Run the import
if (require.main === module) {
  importIngredients()
    .then(() => {
      console.log('✨ Import completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import failed:', error);
      process.exit(1);
    });
}

export { importIngredients };
