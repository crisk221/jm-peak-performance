'use client';

import { useState, useEffect } from 'react';
import { searchIngredients } from '@/app/actions/ingredients';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Ingredient {
  id: string;
  name: string;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  allergens: string;
}

interface IngredientPickerProps {
  onSelect: (ingredient: { 
    ingredientId: string; 
    name: string; 
    per100: { kcal: number; p: number; c: number; f: number } 
  }) => void;
  onClose: () => void;
}

export default function IngredientPicker({ onSelect, onClose }: IngredientPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const result = await searchIngredients(query, 1, 20);
        setResults(result.ingredients);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(searchTimer);
  }, [query]);

  const handleSelect = (ingredient: Ingredient) => {
    onSelect({
      ingredientId: ingredient.id,
      name: ingredient.name,
      per100: {
        kcal: ingredient.kcalPer100g,
        p: ingredient.proteinPer100g,
        c: ingredient.carbsPer100g,
        f: ingredient.fatPer100g
      }
    });
    onClose();
  };

  return (
    <Card className="p-4 w-full max-w-md">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add Ingredient</h3>
          <Button variant="outline" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <Input
          placeholder="Search ingredients..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        {isLoading && (
          <div className="text-center py-4 text-sm text-gray-500">
            Searching...
          </div>
        )}

        {query.length >= 2 && !isLoading && results.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-2">No ingredients found</p>
            <Badge variant="outline" className="text-xs">
              Try a different search term
            </Badge>
          </div>
        )}

        <div className="max-h-64 overflow-y-auto space-y-2">
          {results.map((ingredient) => (
            <div
              key={ingredient.id}
              className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={() => handleSelect(ingredient)}
            >
              <div className="font-medium text-sm mb-1">
                {ingredient.name}
              </div>
              <div className="text-xs text-gray-600">
                {Math.round(ingredient.kcalPer100g)} kcal/100g • 
                P: {Math.round(ingredient.proteinPer100g)}g • 
                C: {Math.round(ingredient.carbsPer100g)}g • 
                F: {Math.round(ingredient.fatPer100g)}g
              </div>
              {ingredient.allergens && (
                <Badge variant="secondary" className="text-xs mt-1">
                  {ingredient.allergens}
                </Badge>
              )}
            </div>
          ))}
        </div>

        {query.length < 2 && (
          <div className="text-center py-4 text-sm text-gray-500">
            Type at least 2 characters to search
          </div>
        )}
      </div>
    </Card>
  );
}
