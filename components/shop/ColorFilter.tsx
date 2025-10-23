"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { getColorHex } from "@/lib/colors";

interface ColorFilterProps {
  availableColors: string[];
  selectedColors: string[];
  onChange: (colors: string[]) => void;
}

export default function ColorFilter({
  availableColors,
  selectedColors,
  onChange,
}: ColorFilterProps) {
  const handleColorToggle = (color: string) => {
    if (selectedColors.includes(color)) {
      onChange(selectedColors.filter((c) => c !== color));
    } else {
      onChange([...selectedColors, color]);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-gray-900">Colors</Label>
      
      {availableColors.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No colors available</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {availableColors.map((color) => {
              const isSelected = selectedColors.includes(color);
              const colorHex = getColorHex(color);
              
              return (
                <button
                  key={color}
                  onClick={() => handleColorToggle(color)}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                    isSelected
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 ${
                      isSelected ? "border-purple-500 ring-2 ring-purple-200" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: colorHex }}
                  />
                  <span className="text-sm text-gray-700 truncate">{color}</span>
                  {isSelected && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      ✓
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {selectedColors.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear all
            </button>
          )}
        </>
      )}
    </div>
  );
}
