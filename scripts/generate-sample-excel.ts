#!/usr/bin/env tsx

/**
 * Sample Excel file generator for testing ingredient import
 */

import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const sampleData = [
  {
    name: 'Chicken Breast',
    unitBase: 'GRAM',
    kcal100: 165,
    protein100: 31,
    carbs100: 0,
    fat100: 3.6,
    category: 'Protein',
    alias: 'chicken,breast,poultry'
  },
  {
    name: 'Brown Rice',
    unitBase: 'GRAM', 
    kcal100: 111,
    protein100: 2.6,
    carbs100: 23,
    fat100: 0.9,
    category: 'Carbohydrate',
    alias: 'rice,brown rice'
  },
  {
    name: 'Olive Oil',
    unitBase: 'ML',
    kcal100: 884,
    protein100: 0,
    carbs100: 0,
    fat100: 100,
    category: 'Fat',
    alias: 'oil,olive,EVOO'
  },
  {
    name: 'Banana',
    unitBase: 'UNIT',
    kcal100: 89,
    protein100: 1.1,
    carbs100: 23,
    fat100: 0.3,
    category: 'Fruit',
    alias: 'fruit,banana'
  },
  {
    name: 'Broccoli',
    unitBase: 'GRAM',
    kcal100: 34,
    protein100: 2.8,
    carbs100: 7,
    fat100: 0.4,
    category: 'Vegetable',
    alias: 'broccoli,green vegetable,cruciferous'
  }
];

function generateSampleExcel() {
  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ingredients');
  
  const filePath = resolve(process.cwd(), 'data/ingredients/JMPP_CUSTOM_INGREDIENT_DB.xlsx');
  XLSX.writeFile(wb, filePath);
  
  console.log(`✅ Generated sample Excel file: ${filePath}`);
  console.log(`📊 Sample contains ${sampleData.length} ingredients for testing`);
}

if (require.main === module) {
  generateSampleExcel();
}
