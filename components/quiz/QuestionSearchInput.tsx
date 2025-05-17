"use client";

import React from 'react';
import { Input } from "@/components/ui/input"; // Assuming Input from shadcn/ui

interface QuestionSearchInputProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}

export function QuestionSearchInput({ searchTerm, onSearchTermChange }: QuestionSearchInputProps) {
  return (
    <Input
      type="search"
      placeholder="Search questions, tags, notes..."
      value={searchTerm}
      onChange={(e) => onSearchTermChange(e.target.value)}
      className="h-9 md:w-[250px] lg:w-[300px]" // Adjust styling as needed
    />
  );
}
