import { useState, useEffect, ChangeEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface QuestionSearchInputProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  debounceDelay?: number;
}

export function QuestionSearchInput({
  searchTerm,
  onSearchTermChange,
  debounceDelay = 150,
}: QuestionSearchInputProps) {
  const [inputValue, setInputValue] = useState(searchTerm);
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  // Debounce effect for onSearchTermChange
  useEffect(() => {
    // If inputValue is already what the parent expects (searchTerm),
    // no need to call onSearchTermChange again.
    // This handles cases where searchTerm prop changes and syncs inputValue,
    // or when the clear button is used (which calls onSearchTermChange directly).
    if (inputValue === searchTerm) {
      return;
    }

    const handler = setTimeout(() => {
      onSearchTermChange(inputValue);
    }, debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, searchTerm, debounceDelay, onSearchTermChange]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleClearSearch = () => {
    setInputValue('');
    onSearchTermChange(''); // Immediately update parent state
  };

  return (
    <div className="relative">
      <Input
        type="search"
        placeholder="Search questions, tags, notes..."
        value={inputValue}
        onChange={handleInputChange}
        className="h-9 md:w-[250px] lg:w-[300px] pr-10"
      />
      {inputValue && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          onClick={handleClearSearch}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
