'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Upload, FileText, PlayCircle, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ColumnMapping } from '@/lib/ingredient-import';
import { normalizeHeader, unique } from '@/lib/ingredient-import';

const UNMAPPED = "__UNMAPPED__";

type ImportStep = 'upload' | 'preview' | 'dry-run' | 'import';

interface FileMeta {
  name: string;
  size: number;
  type: string;
}

interface PreviewData {
  preview: Array<{
    name: string;
    kcalPer100g: number | null;
    proteinPer100g: number | null;
    carbsPer100g: number | null;
    fatPer100g: number | null;
    allergens: string[];
    action: 'insert' | 'update' | 'skip';
  }>;
  detectedHeaders: string[];
  suggestedMapping: ColumnMapping;
  totalRows: number;
  countsByAction: {
    insert: number;
    update: number;
    skip: number;
  };
  fileMeta: FileMeta;
}

interface DryRunResult {
  dryRun: true;
  countsByAction: {
    insert: number;
    update: number;
    skip: number;
  };
  totalRows: number;
}

interface ImportResult {
  success: true;
  result: {
    inserted: number;
    updated: number;
    skipped: number;
    errors: string[];
  };
}

const MAPPED_FIELDS = {
  name: 'Name',
  kcalPer100g: 'Calories (per 100g)',
  proteinPer100g: 'Protein (per 100g)',
  carbsPer100g: 'Carbs (per 100g)', 
  fatPer100g: 'Fat (per 100g)',
  allergens: 'Allergens'
} as const;

export default function ImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setFile(null);
    setMapping({});
    setPreviewData(null);
    setDryRunResult(null);
    setImportResult(null);
    setError(null);
    setLoading(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ingredients/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Upload failed');
      }

      setPreviewData(data);
      setMapping(data.suggestedMapping);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (field: keyof ColumnMapping, column: string | undefined) => {
    setMapping(prev => ({
      ...prev,
      [field]: column === UNMAPPED ? null : (column || null)
    }));
  };

  const handlePreviewNext = async () => {
    if (!file || !previewData) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mapping', JSON.stringify(mapping));

      const response = await fetch('/api/ingredients/import?dryRun=1', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Dry run failed');
      }

      setDryRunResult(data);
      setStep('dry-run');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dry run failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mapping', JSON.stringify(mapping));

      const response = await fetch('/api/ingredients/import?commit=1', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Import failed');
      }

      setImportResult(data);
      setStep('import');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (stepName: ImportStep) => {
    switch (stepName) {
      case 'upload': return <Upload className="w-4 h-4" />;
      case 'preview': return <FileText className="w-4 h-4" />;
      case 'dry-run': return <PlayCircle className="w-4 h-4" />;
      case 'import': return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getStepNumber = (stepName: ImportStep) => {
    const steps = ['upload', 'preview', 'dry-run', 'import'];
    return steps.indexOf(stepName) + 1;
  };

  const isStepActive = (stepName: ImportStep) => step === stepName;
  const isStepCompleted = (stepName: ImportStep) => {
    const steps = ['upload', 'preview', 'dry-run', 'import'];
    return steps.indexOf(stepName) < steps.indexOf(step);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard/ingredients')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Ingredients
          </Button>
          <h1 className="text-3xl font-bold">Import Ingredients</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 bg-muted/50 rounded-lg p-4">
          {(['upload', 'preview', 'dry-run', 'import'] as const).map((stepName, index) => (
            <React.Fragment key={stepName}>
              <div className={`flex items-center gap-2 ${
                isStepActive(stepName) ? 'text-primary' : 
                isStepCompleted(stepName) ? 'text-muted-foreground' : 'text-muted-foreground/50'
              }`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  isStepActive(stepName) ? 'bg-primary text-primary-foreground' :
                  isStepCompleted(stepName) ? 'bg-muted text-muted-foreground' : 'bg-muted/50'
                }`}>
                  {isStepCompleted(stepName) ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    getStepIcon(stepName)
                  )}
                </div>
                <span className="font-medium capitalize">{stepName.replace('-', ' ')}</span>
              </div>
              {index < 3 && (
                <div className={`h-0.5 flex-1 mx-4 ${
                  isStepCompleted(stepName) ? 'bg-muted' : 'bg-muted/50'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="file">Select CSV or Excel file</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Supports CSV, Excel (.xlsx, .xls) files up to 10MB
                </p>
              </div>

              {file && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleUpload} 
                disabled={!file || loading}
                className="w-full"
              >
                {loading ? 'Uploading...' : 'Upload & Preview'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Preview & Map */}
        {step === 'preview' && previewData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Map Columns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {Object.entries(MAPPED_FIELDS).map(([field, label]) => {
                    // Build sanitized selectable options
                    const selectableOptions = unique(
                      previewData.detectedHeaders
                        .map(normalizeHeader)
                        .filter(h => h.length > 0) // 🚫 drop empty strings
                    );

                    return (
                      <div key={field}>
                        <Label>{label} {field === 'name' && <span className="text-red-500">*</span>}</Label>
                        <Select
                          value={mapping[field as keyof ColumnMapping] ?? UNMAPPED}
                          onValueChange={(value) => handleMappingChange(field as keyof ColumnMapping, value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Choose a column…" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={UNMAPPED}>Unmapped</SelectItem>
                            {selectableOptions.map(header => (
                              <SelectItem key={header} value={header}>{header}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                  <span>Preview (first 20 of {previewData.totalRows} rows)</span>
                  <div className="flex gap-4">
                    <Badge variant="secondary">Insert: {previewData.countsByAction.insert}</Badge>
                    <Badge variant="outline">Update: {previewData.countsByAction.update}</Badge>
                    <Badge variant="secondary">Skip: {previewData.countsByAction.skip}</Badge>
                  </div>
                </div>

                <div className="border rounded-lg max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Calories</TableHead>
                        <TableHead>Protein</TableHead>
                        <TableHead>Carbs</TableHead>
                        <TableHead>Fat</TableHead>
                        <TableHead>Allergens</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.preview.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Badge variant={
                              row.action === 'insert' ? 'default' :
                              row.action === 'update' ? 'secondary' : 'outline'
                            }>
                              {row.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell>{row.kcalPer100g ?? '-'}</TableCell>
                          <TableCell>{row.proteinPer100g ?? '-'}</TableCell>
                          <TableCell>{row.carbsPer100g ?? '-'}</TableCell>
                          <TableCell>{row.fatPer100g ?? '-'}</TableCell>
                          <TableCell>
                            {row.allergens.length > 0 ? row.allergens.join(', ') : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => setStep('upload')}>
                    Back
                  </Button>
                  <Button 
                    onClick={handlePreviewNext}
                    disabled={!mapping.name || loading}
                    className="flex-1"
                  >
                    {loading ? 'Processing...' : 'Continue to Dry Run'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Dry Run */}
        {step === 'dry-run' && dryRunResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Dry Run Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This is a simulation. No changes will be made to your database until you proceed with the import.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">{dryRunResult.countsByAction.insert}</div>
                    <p className="text-sm text-muted-foreground">New ingredients to insert</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">{dryRunResult.countsByAction.update}</div>
                    <p className="text-sm text-muted-foreground">Existing ingredients to update</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-gray-600">{dryRunResult.countsByAction.skip}</div>
                    <p className="text-sm text-muted-foreground">Rows to skip (invalid data)</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep('preview')}>
                  Back to Preview
                </Button>
                <Button 
                  onClick={handleImport}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Importing...' : `Import ${dryRunResult.totalRows} Ingredients`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Import Complete */}
        {step === 'import' && importResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                Import Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your ingredients have been successfully imported!
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">{importResult.result.inserted}</div>
                    <p className="text-sm text-muted-foreground">New ingredients added</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">{importResult.result.updated}</div>
                    <p className="text-sm text-muted-foreground">Existing ingredients updated</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-gray-600">{importResult.result.skipped}</div>
                    <p className="text-sm text-muted-foreground">Rows skipped</p>
                  </CardContent>
                </Card>
              </div>

              {importResult.result.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <details>
                      <summary className="cursor-pointer">
                        {importResult.result.errors.length} error(s) occurred during import
                      </summary>
                      <ul className="mt-2 space-y-1">
                        {importResult.result.errors.map((error, index) => (
                          <li key={index} className="text-sm">• {error}</li>
                        ))}
                      </ul>
                    </details>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    resetState();
                    setStep('upload');
                  }}
                >
                  Import Another File
                </Button>
                <Button 
                  onClick={() => router.push('/dashboard/ingredients')}
                  className="flex-1"
                >
                  View All Ingredients
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
