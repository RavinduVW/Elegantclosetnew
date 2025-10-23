"use client";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { sortSizes } from "@/lib/sizes";

interface SizeFilterProps {
  availableSizes: string[];
  selectedSizes: string[];
  onChange: (sizes: string[]) => void;
}

export default function SizeFilter({
  availableSizes,
  selectedSizes,
  onChange,
}: SizeFilterProps) {
  const sortedSizes = sortSizes(availableSizes);

  const handleSizeToggle = (size: string) => {
    if (selectedSizes.includes(size)) {
      onChange(selectedSizes.filter((s) => s !== size));
    } else {
      onChange([...selectedSizes, size]);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-gray-900">Sizes</Label>
      
      {sortedSizes.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No sizes available</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {sortedSizes.map((size) => {
              const isSelected = selectedSizes.includes(size);
              
              return (
                <button
                  key={size}
                  onClick={() => handleSizeToggle(size)}
                  className={`px-4 py-2 rounded-lg border transition-all font-medium ${
                    isSelected
                      ? "border-purple-500 bg-purple-500 text-white shadow-md"
                      : "border-gray-300 bg-white text-gray-700 hover:border-purple-400 hover:bg-purple-50"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>

          {selectedSizes.length > 0 && (
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
