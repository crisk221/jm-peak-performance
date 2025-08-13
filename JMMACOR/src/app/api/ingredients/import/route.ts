export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  parseFileBuffer,
  normalizeRows,
  calculateActionCounts,
  suggestColumnMapping,
  normalizeIngredientName,
  type ColumnMapping,
  type ImportResult,
} from '@/lib/ingredient-import';

const prisma = new PrismaClient();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const commit = url.searchParams.get('commit') === '1';
    const dryRun = url.searchParams.get('dryRun') === '1';

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mappingJson = formData.get('mapping') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'File too large',
          message: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`
        },
        { status: 413 }
      );
    }

    // Check file type
    const allowedTypes = [
      'text/csv',
      'application/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const isValidType = allowedTypes.includes(file.type) || 
                       file.name.toLowerCase().endsWith('.csv') ||
                       file.name.toLowerCase().endsWith('.xlsx') ||
                       file.name.toLowerCase().endsWith('.xls');

    if (!isValidType) {
      return NextResponse.json(
        { 
          error: 'Invalid file type',
          message: 'Please upload a CSV or Excel file (.csv, .xlsx, .xls)'
        },
        { status: 400 }
      );
    }

    // Parse file
    const buffer = Buffer.from(await file.arrayBuffer());
    let rawRows;
    
    try {
      rawRows = parseFileBuffer(buffer, file.name);
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Parse error',
          message: error instanceof Error ? error.message : 'Failed to parse file'
        },
        { status: 400 }
      );
    }

    if (rawRows.length === 0) {
      return NextResponse.json(
        { 
          error: 'Empty file',
          message: 'No data rows found in file'
        },
        { status: 400 }
      );
    }

    // Get detected headers
    const detectedHeaders = Object.keys(rawRows[0] || {});
    
    if (detectedHeaders.length === 0) {
      return NextResponse.json(
        { 
          error: 'No headers',
          message: 'No column headers detected in file'
        },
        { status: 400 }
      );
    }

    // Use provided mapping or suggest one
    let mapping: ColumnMapping;
    if (mappingJson) {
      try {
        mapping = JSON.parse(mappingJson);
      } catch {
        return NextResponse.json(
          { error: 'Invalid mapping JSON' },
          { status: 400 }
        );
      }
    } else {
      mapping = suggestColumnMapping(detectedHeaders);
    }

    // Validate that required columns are mapped
    if (!mapping.name) {
      return NextResponse.json(
        { 
          error: 'Missing required mapping',
          message: 'Name column must be mapped'
        },
        { status: 400 }
      );
    }

    // Get existing ingredients for conflict detection
    const existingIngredients = await prisma.ingredient.findMany({
      select: { id: true, name: true }
    });

    // Normalize rows
    const normalizedRows = await normalizeRows(rawRows, mapping, existingIngredients);
    const actionCounts = calculateActionCounts(normalizedRows);

    // If this is just a preview (no commit), return preview data
    if (!commit) {
      return NextResponse.json({
        preview: normalizedRows.slice(0, 20), // First 20 rows for preview
        detectedHeaders,
        suggestedMapping: mappingJson ? mapping : suggestColumnMapping(detectedHeaders),
        totalRows: normalizedRows.length,
        countsByAction: actionCounts,
        fileMeta: {
          name: file.name,
          size: file.size,
          type: file.type,
        }
      });
    }

    // If dry run, return counts without making changes
    if (dryRun) {
      return NextResponse.json({
        dryRun: true,
        countsByAction: actionCounts,
        totalRows: normalizedRows.length,
      });
    }

    // Perform actual import
    const result = await performImport(normalizedRows, existingIngredients);
    
    return NextResponse.json({
      success: true,
      result,
    });

  } catch (error) {
    console.error('Import API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

async function performImport(
  normalizedRows: Awaited<ReturnType<typeof normalizeRows>>,
  existingIngredients: Array<{ id: string; name: string }>
): Promise<ImportResult> {
  const result: ImportResult = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: []
  };

  // Create a map for faster lookups
  const existingByName = new Map(
    existingIngredients.map(ing => [
      normalizeIngredientName(ing.name),
      ing
    ])
  );

  // Process in batches to avoid overwhelming the database
  const BATCH_SIZE = 50;
  const validRows = normalizedRows.filter(row => row.action !== 'skip');
  
  for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
    const batch = validRows.slice(i, i + BATCH_SIZE);
    
    const batchPromises = batch.map(async (row) => {
      try {
        const normalizedName = normalizeIngredientName(row.name);
        const existing = existingByName.get(normalizedName);
        
        const data = {
          name: row.name, // Keep original casing
          kcalPer100g: row.kcalPer100g,
          proteinPer100g: row.proteinPer100g,
          carbsPer100g: row.carbsPer100g,
          fatPer100g: row.fatPer100g,
          allergens: JSON.stringify(row.allergens),
        };

        if (existing) {
          // Update existing ingredient
          await prisma.ingredient.update({
            where: { id: existing.id },
            data,
          });
          return 'updated';
        } else {
          // Create new ingredient
          await prisma.ingredient.create({
            data,
          });
          return 'inserted';
        }
      } catch (error) {
        console.error(`Error processing row ${row.name}:`, error);
        result.errors.push(`Failed to process ${row.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return 'error';
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((promiseResult) => {
      if (promiseResult.status === 'fulfilled') {
        const action = promiseResult.value;
        if (action === 'inserted') result.inserted++;
        else if (action === 'updated') result.updated++;
      }
    });
  }

  // Count skipped rows
  result.skipped = normalizedRows.filter(row => row.action === 'skip').length;

  return result;
}
