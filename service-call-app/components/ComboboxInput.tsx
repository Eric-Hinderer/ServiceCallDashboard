"use client";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";

interface ComboboxInputProps {
  options: string[];
  defaultValue?: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
}

export default function ComboboxInput({
  options,
  defaultValue = "",
  name,
  required = false,
  placeholder = "Enter or select...",
}: ComboboxInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = value.trim()
    ? options.filter((opt) => opt.toLowerCase().includes(value.toLowerCase()))
    : options;

  const exactMatch = options.some(
    (opt) => opt.toLowerCase() === value.toLowerCase().trim()
  );

  const showAddButton = value.trim().length > 0 && !exactMatch;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <Input
          type="text"
          name={name}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {showAddButton && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setValue(value.trim());
              setOpen(false);
            }}
            className="shrink-0 flex items-center gap-1 text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center gap-2"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setValue(opt);
                setOpen(false);
              }}
            >
              {value.toLowerCase() === opt.toLowerCase() ? (
                <Check className="h-4 w-4 text-blue-600 shrink-0" />
              ) : (
                <span className="w-4 h-4 shrink-0" />
              )}
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
