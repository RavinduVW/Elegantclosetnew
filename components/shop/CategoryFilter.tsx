"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  subCategories?: SubCategory[];
  productCount?: number;
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  selectedSubCategoryId: string | null;
  onCategoryChange: (categoryId: string | null, subCategoryId: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategoryId,
  selectedSubCategoryId,
  onCategoryChange,
}: CategoryFilterProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(selectedCategoryId ? [selectedCategoryId] : [])
  );

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-gray-900">Categories</Label>
      
      <div className="space-y-1">
        <button
          onClick={() => onCategoryChange(null, null)}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
            !selectedCategoryId
              ? "bg-purple-50 text-purple-700 font-medium"
              : "hover:bg-gray-50 text-gray-700"
          }`}
        >
          All Products
        </button>

        {categories.map((category) => {
          const isExpanded = expandedCategories.has(category.id);
          const isSelected = selectedCategoryId === category.id && !selectedSubCategoryId;
          const hasSubCategories = category.subCategories && category.subCategories.length > 0;

          return (
            <div key={category.id} className="space-y-1">
              <div className="flex items-center gap-1">
                {hasSubCategories && (
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                )}
                
                <button
                  onClick={() => onCategoryChange(category.id, null)}
                  className={`flex-1 text-left px-3 py-2 rounded-lg transition-colors ${
                    !hasSubCategories ? "ml-6" : ""
                  } ${
                    isSelected
                      ? "bg-purple-50 text-purple-700 font-medium"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{category.name}</span>
                    {category.productCount !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        {category.productCount}
                      </Badge>
                    )}
                  </div>
                </button>
              </div>

              {hasSubCategories && isExpanded && (
                <div className="ml-8 space-y-1">
                  {category.subCategories!.map((subCategory) => {
                    const isSubSelected = selectedSubCategoryId === subCategory.id;

                    return (
                      <button
                        key={subCategory.id}
                        onClick={() => onCategoryChange(category.id, subCategory.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                          isSubSelected
                            ? "bg-purple-50 text-purple-700 font-medium"
                            : "hover:bg-gray-50 text-gray-600"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{subCategory.name}</span>
                          {subCategory.productCount !== undefined && (
                            <Badge variant="secondary" className="text-xs">
                              {subCategory.productCount}
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
