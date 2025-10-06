"use client";

import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Category } from "./header-config";

interface CategoryLinkProps {
  category: Category;
  isActive: boolean;
}

export const CategoryLink = memo(({ category, isActive }: CategoryLinkProps) => {
  return (
    <Link
      href={category.href}
      className={`relative text-sm font-medium transition-colors duration-200 hover:text-gray-900 ${
        isActive ? "text-gray-900" : "text-gray-600"
      }`}
    >
      {category.name}
      {isActive && (
        <motion.div
          layoutId="activeCategory"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gray-900"
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 30,
          }}
        />
      )}
    </Link>
  );
});

CategoryLink.displayName = "CategoryLink";

interface MobileCategoryLinkProps {
  category: Category;
  isActive: boolean;
  onClick: () => void;
}

export const MobileCategoryLink = memo(
  ({ category, isActive, onClick }: MobileCategoryLinkProps) => {
    return (
      <Link
        href={category.href}
        onClick={onClick}
        className={`block py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-gray-100 text-gray-900"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        {category.name}
      </Link>
    );
  }
);

MobileCategoryLink.displayName = "MobileCategoryLink";
