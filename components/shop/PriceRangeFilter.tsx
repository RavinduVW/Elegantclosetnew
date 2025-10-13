"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/currency";

interface PriceRangeFilterProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  currency?: string;
}

export default function PriceRangeFilter({
  min,
  max,
  value,
  onChange,
  currency = "LKR"
}: PriceRangeFilterProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleSliderChange = (newValue: number[]) => {
    const rangeValue: [number, number] = [newValue[0], newValue[1]];
    setLocalValue(rangeValue);
    onChange(rangeValue);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Number(e.target.value) || min;
    const newValue: [number, number] = [Math.min(newMin, localValue[1]), localValue[1]];
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value) || max;
    const newValue: [number, number] = [localValue[0], Math.max(newMax, localValue[0])];
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold text-gray-900">Price Range</Label>
      
      <Slider
        min={min}
        max={max}
        step={100}
        value={localValue}
        onValueChange={handleSliderChange}
        className="w-full"
      />

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            type="number"
            value={localValue[0]}
            onChange={handleMinInputChange}
            min={min}
            max={localValue[1]}
            className="text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formatCurrency(localValue[0], currency as any)}
          </p>
        </div>
        
        <span className="text-gray-400">-</span>
        
        <div className="flex-1">
          <Input
            type="number"
            value={localValue[1]}
            onChange={handleMaxInputChange}
            min={localValue[0]}
            max={max}
            className="text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formatCurrency(localValue[1], currency as any)}
          </p>
        </div>
      </div>
    </div>
  );
}
