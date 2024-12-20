"use client";

import invariant from "invariant";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxSharedProps {
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

interface SingleComboboxProps extends ComboboxSharedProps {
  multiple?: false;
  value: string;
  onValueChange: (value: string) => void;
}

interface MultiComboboxProps extends ComboboxSharedProps {
  multiple: true;
  value: string[];
  onValueChange: (value: string[]) => void;
}

type ComboboxProps = SingleComboboxProps | MultiComboboxProps;

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  multiple = false,
}: ComboboxProps) {
  // Value is required for single select, array required for multi-select
  invariant(
    multiple ? Array.isArray(value) : typeof value === "string",
    multiple
      ? "Value must be an array for multi-select"
      : "Value must be a string for single select",
  );

  const [open, setOpen] = React.useState(false);

  const handleSelect = (currentValue: string) => {
    if (multiple) {
      const values = value as string[];
      const newValue = values.includes(currentValue)
        ? values.filter((val) => val !== currentValue)
        : [...values, currentValue];
      (onValueChange as (value: string[]) => void)(newValue);
    } else {
      const singleValue = value as string;
      (onValueChange as (value: string) => void)(
        currentValue === singleValue ? "" : currentValue,
      );
      setOpen(false);
    }
  };

  const removeValue = (valueToRemove: string) => {
    if (multiple) {
      const values = value as string[];
      (onValueChange as (value: string[]) => void)(
        values.filter((val) => val !== valueToRemove),
      );
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("min-h-10 justify-between", className)}
          asChild={multiple}
        >
          <div>
            <div className="flex flex-wrap gap-1">
              {!multiple && value ? (
                options.find((option) => option.value === value)?.label
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", className)}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      multiple
                        ? (value as string[]).includes(option.value)
                          ? "opacity-100"
                          : "opacity-0"
                        : value === option.value
                          ? "opacity-100"
                          : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
