'use client';

import { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { sanitizeString } from '@/lib/sanitize';

interface ChipInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  maxChips?: number;
}

export function ChipInput({
  value,
  onChange,
  placeholder = "Type and press Enter to add...",
  suggestions = [],
  maxChips = 30,
}: ChipInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addChip = (chip: string) => {
    const sanitized = sanitizeString(chip);
    if (!sanitized) return;
    
    // Check for duplicates (case-insensitive)
    const isDuplicate = value.some(existing => 
      existing.toLowerCase() === sanitized.toLowerCase()
    );
    
    if (!isDuplicate && value.length < maxChips) {
      onChange([...value, sanitized]);
    }
    setInputValue('');
  };

  const removeChip = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addChip(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last chip when backspace on empty input
      removeChip(value.length - 1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addChip(suggestion);
  };

  const availableSuggestions = suggestions.filter(suggestion =>
    !value.some(existing => existing.toLowerCase() === suggestion.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {/* Chips Display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((chip, index) => (
            <Badge key={index} variant="secondary" className="pr-1">
              {chip}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-1 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeChip(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length >= maxChips ? `Maximum ${maxChips} items` : placeholder}
        disabled={value.length >= maxChips}
      />

      {/* Suggestions */}
      {availableSuggestions.length > 0 && value.length < maxChips && (
        <div className="flex flex-wrap gap-1">
          {availableSuggestions.map((suggestion) => (
            <Button
              key={suggestion}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(suggestion)}
              className="h-7 text-xs"
            >
              + {suggestion}
            </Button>
          ))}
        </div>
      )}

      {value.length >= maxChips && (
        <p className="text-xs text-muted-foreground">
          Maximum {maxChips} items reached
        </p>
      )}
    </div>
  );
}
