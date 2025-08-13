# CSV/XLSX Ingredient Import Documentation

## Overview

The ingredient import system allows users to bulk import ingredients from CSV or Excel files through a 4-step wizard interface. The system provides intelligent column mapping, data validation, dry-run simulation, and comprehensive error handling.

## Features

### Supported File Formats
- **CSV** (.csv) - Comma-separated values
- **Excel** (.xlsx, .xls) - Microsoft Excel formats
- **Size Limit**: 10MB maximum file size

### 4-Step Import Process

#### Step 1: Upload
- File selection with format validation
- Size validation (10MB limit)
- Automatic file parsing and header detection

#### Step 2: Preview & Map
- **Intelligent Column Mapping**: Automatically suggests mappings based on header names
- **Manual Override**: Users can adjust mappings for any field
- **Required Fields**: Name field must be mapped (marked with red asterisk)
- **Preview Table**: Shows first 20 rows with normalized data
- **Action Indicators**: Shows which ingredients will be inserted, updated, or skipped

#### Step 3: Dry Run
- **Simulation**: Shows what would happen without making changes
- **Count Summary**: Displays how many ingredients will be inserted, updated, or skipped
- **Safety Check**: Final review before committing changes

#### Step 4: Import
- **Batch Processing**: Processes ingredients in batches of 50 for performance
- **Progress Tracking**: Shows real-time import progress
- **Error Handling**: Collects and displays any errors encountered
- **Success Summary**: Final report of imported ingredients

## Column Mapping

### Required Fields
- **Name** (required): Ingredient name

### Optional Nutrition Fields
- **Calories per 100g**: Energy content (kcal/100g)
- **Protein per 100g**: Protein content (g/100g) 
- **Carbs per 100g**: Carbohydrate content (g/100g)
- **Fat per 100g**: Fat content (g/100g)
- **Allergens**: Comma-separated list of allergens

### Auto-Detection
The system automatically suggests column mappings based on common header patterns:

```typescript
// Example header matches:
"name" → Name field
"protein", "protein_per_100g", "protein (g)" → Protein field
"calories", "kcal", "energy" → Calories field
"carbs", "carbohydrates", "carb" → Carbs field
"fat", "lipid", "fat_per_100g" → Fat field
"allergens", "allergen", "allergy" → Allergens field
```

## Data Processing

### Normalization
- **Name Matching**: Case-insensitive matching for existing ingredient detection
- **Number Coercion**: Automatic conversion of text numbers to numeric values
- **Allergen Parsing**: Splits comma-separated allergen lists
- **Data Validation**: Uses Zod schema validation for all fields

### Conflict Resolution
- **Insert**: Creates new ingredient if name doesn't exist
- **Update**: Updates existing ingredient if name matches (case-insensitive)
- **Skip**: Skips rows with invalid data or missing required fields

### Error Handling
- **File-level**: Invalid format, size limits, parsing errors
- **Row-level**: Missing required data, invalid values
- **Database-level**: Constraint violations, connection issues

## Sample CSV Format

```csv
Name,Calories per 100g,Protein per 100g,Carbohydrates per 100g,Fat per 100g,Allergens
Chicken Breast,165,31,0,3.6,None
Salmon,208,25,0,12,Fish
Brown Rice,111,2.6,23,0.9,None
Almonds,579,21,22,50,"Tree Nuts"
Greek Yogurt,59,10,3.6,0.4,Milk
```

## API Endpoints

### POST `/api/ingredients/import`

#### Query Parameters
- `commit=1`: Perform actual import (Step 4)
- `dryRun=1`: Simulation mode (Step 3)
- No parameters: Preview mode (Step 2)

#### Request Body
- `file`: Multipart file (CSV/Excel)
- `mapping`: JSON string of column mappings (Steps 3-4)

#### Response Formats

**Preview Mode:**
```json
{
  "preview": [...], // First 20 normalized rows
  "detectedHeaders": [...], // Column headers found
  "suggestedMapping": {...}, // Auto-suggested mappings
  "totalRows": 100,
  "countsByAction": {
    "insert": 80,
    "update": 15,
    "skip": 5
  },
  "fileMeta": {
    "name": "ingredients.csv",
    "size": 12345,
    "type": "text/csv"
  }
}
```

**Dry Run Mode:**
```json
{
  "dryRun": true,
  "countsByAction": {
    "insert": 80,
    "update": 15,
    "skip": 5
  },
  "totalRows": 100
}
```

**Import Mode:**
```json
{
  "success": true,
  "result": {
    "inserted": 80,
    "updated": 15,
    "skipped": 5,
    "errors": ["Error messages..."]
  }
}
```

## Technical Implementation

### Architecture
- **Frontend**: React component with step-based state management
- **Backend**: Next.js API route with Node.js runtime
- **Database**: Prisma with SQLite, case-insensitive upserts
- **File Parsing**: xlsx library for Excel, built-in CSV parsing

### Performance Optimizations
- **Streaming**: Large files processed in memory-efficient chunks
- **Batch Processing**: Database operations in batches of 50
- **Error Isolation**: Individual row errors don't stop the entire import
- **Progress Tracking**: Real-time feedback for large imports

### Security Features
- **File Type Validation**: Strict MIME type and extension checking
- **Size Limits**: 10MB maximum to prevent resource exhaustion
- **Input Sanitization**: All data validated through Zod schemas
- **Error Sanitization**: Database errors sanitized before user display

## Usage Instructions

1. **Navigate** to `/dashboard/ingredients`
2. **Click** "Import CSV/Excel" button
3. **Upload** your CSV or Excel file
4. **Review** the auto-mapped columns and adjust if needed
5. **Preview** the first 20 rows to verify data looks correct
6. **Run Dry Run** to see what changes will be made
7. **Import** to commit the changes to your database
8. **Review** the final results and any error messages

## Troubleshooting

### Common Issues
- **"No file provided"**: Ensure you've selected a file before uploading
- **"File too large"**: Files must be under 10MB
- **"Invalid file type"**: Only CSV and Excel files are supported
- **"No data rows found"**: File appears to be empty or incorrectly formatted
- **"Name column must be mapped"**: The Name field is required for all imports

### File Format Tips
- Use UTF-8 encoding for CSV files with special characters
- Ensure the first row contains column headers
- Use consistent number formatting (e.g., decimals with periods)
- Quote text fields containing commas in CSV files
- Keep allergen lists comma-separated (e.g., "Milk, Eggs")
