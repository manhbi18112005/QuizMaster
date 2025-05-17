"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

type Framework = Record<"value" | "label", string>;

interface FancyMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  availableOptions?: string[];
  placeholder?: string;
  allowCreate?: boolean; // New prop
}

export function FancyMultiSelect({
  value,
  onChange,
  availableOptions = [],
  placeholder = "Select or create...",
  allowCreate = true, // Default to true
}: FancyMultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // Convert string array value to Framework array for internal use
  const selectedFrameworks: Framework[] = React.useMemo(
    () => value.map((v) => ({ value: v, label: v })),
    [value],
  );

  const handleUnselect = React.useCallback(
    (framework: Framework) => {
      onChange(
        selectedFrameworks
          .filter((s) => s.value !== framework.value)
          .map((s) => s.value),
      );
    },
    [selectedFrameworks, onChange],
  );

  const handleSelectFramework = React.useCallback(
    (framework: Framework) => {
      setInputValue("");
      if (!selectedFrameworks.find((s) => s.value === framework.value)) {
        onChange([...selectedFrameworks.map((s) => s.value), framework.value]);
      }
      // Keep focus on input or blur as needed
      // inputRef.current?.focus();
    },
    [selectedFrameworks, onChange],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "") {
            const newSelected = [...selectedFrameworks];
            newSelected.pop();
            onChange(newSelected.map((s) => s.value));
          }
        }
        if (e.key === "Escape") {
          input.blur();
        }
        if (e.key === "Enter" && inputValue.trim() !== "") {
          e.preventDefault();
          const newTagValue = inputValue.trim();
          const existingSelectable = availableOptions
            .map((opt) => ({ value: opt, label: opt }))
            .find(
              (opt) =>
                opt.label.toLowerCase() === newTagValue.toLowerCase(),
            );

          if (
            existingSelectable &&
            !selectedFrameworks.find((s) => s.value === existingSelectable.value)
          ) {
            handleSelectFramework(existingSelectable);
          } else if (
            allowCreate && // Check allowCreate before creating new tag
            !selectedFrameworks.find(
              (s) => s.value.toLowerCase() === newTagValue.toLowerCase(),
            )
          ) {
            handleSelectFramework({ value: newTagValue, label: newTagValue });
          }
          setInputValue("");
        }
      }
    },
    [inputValue, selectedFrameworks, onChange, availableOptions, allowCreate, handleSelectFramework], // Added allowCreate to dependencies
  );

  const allFrameworkOptions = React.useMemo(() => {
    const baseOptions = availableOptions.map((opt) => ({ value: opt, label: opt }));
    // Add any selected tags that might not be in availableOptions (e.g. created tags)
    selectedFrameworks.forEach((sf) => {
      if (!baseOptions.find((bo) => bo.value === sf.value)) {
        baseOptions.push(sf);
      }
    });
    return baseOptions;
  }, [availableOptions, selectedFrameworks]);

  const selectables = React.useMemo(() => {
    let filteredOptions = allFrameworkOptions.filter(
      (framework) => !selectedFrameworks.some((s) => s.value === framework.value),
    );

    if (inputValue.trim() !== "") {
      filteredOptions = filteredOptions.filter((framework) =>
        framework.label.toLowerCase().includes(inputValue.toLowerCase()),
      );
    }
    return filteredOptions;
  }, [allFrameworkOptions, selectedFrameworks, inputValue]);

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible bg-transparent"
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selectedFrameworks.map((framework) => {
            return (
              <Badge key={framework.value} variant="secondary">
                {framework.label}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(framework);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(framework)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setTimeout(() => setOpen(false), 100)} // Delay to allow click on item
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        <CommandList>
          {open && selectables.length > 0 ? (
            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandGroup className="h-full max-h-60 overflow-auto">
                {selectables.map((framework) => {
                  return (
                    <CommandItem
                      key={framework.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={() => handleSelectFramework(framework)}
                      className={"cursor-pointer"}
                    >
                      {framework.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          ) : null}
          {open && selectables.length === 0 && inputValue.trim() !== "" && allowCreate && ( // Check allowCreate here
            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandGroup>
                <CommandItem
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onSelect={() => {
                    handleSelectFramework({
                      value: inputValue.trim(),
                      label: inputValue.trim(),
                    });
                  }}
                  className={"cursor-pointer"}
                >
                  Create {inputValue.trim()}
                </CommandItem>
              </CommandGroup>
            </div>
          )}
        </CommandList>
      </div>
    </Command>
  );
}