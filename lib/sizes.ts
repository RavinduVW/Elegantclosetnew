/**
 * Size Management System
 * Predefined sizes and utilities for clothing products
 */

export interface SizeOption {
  code: string;
  name: string;
  description?: string;
  order: number;
}

export const PREDEFINED_SIZES: SizeOption[] = [
  { code: 'XXS', name: 'Extra Extra Small', order: 1 },
  { code: 'XS', name: 'Extra Small', order: 2 },
  { code: 'S', name: 'Small', order: 3 },
  { code: 'M', name: 'Medium', order: 4 },
  { code: 'L', name: 'Large', order: 5 },
  { code: 'XL', name: 'Extra Large', order: 6 },
  { code: 'XXL', name: 'Double Extra Large', order: 7 },
  { code: '3XL', name: 'Triple Extra Large', order: 8 },
  { code: '4XL', name: 'Quad Extra Large', order: 9 },
  { code: '5XL', name: 'Quintuple Extra Large', order: 10 },
];

export const NUMERIC_SIZES: SizeOption[] = [
  { code: '28', name: 'Size 28', order: 1 },
  { code: '30', name: 'Size 30', order: 2 },
  { code: '32', name: 'Size 32', order: 3 },
  { code: '34', name: 'Size 34', order: 4 },
  { code: '36', name: 'Size 36', order: 5 },
  { code: '38', name: 'Size 38', order: 6 },
  { code: '40', name: 'Size 40', order: 7 },
  { code: '42', name: 'Size 42', order: 8 },
  { code: '44', name: 'Size 44', order: 9 },
  { code: '46', name: 'Size 46', order: 10 },
];

export const KIDS_SIZES: SizeOption[] = [
  { code: '2T', name: '2 Toddler', order: 1 },
  { code: '3T', name: '3 Toddler', order: 2 },
  { code: '4T', name: '4 Toddler', order: 3 },
  { code: '5', name: 'Size 5', order: 4 },
  { code: '6', name: 'Size 6', order: 5 },
  { code: '7', name: 'Size 7', order: 6 },
  { code: '8', name: 'Size 8', order: 7 },
  { code: '10', name: 'Size 10', order: 8 },
  { code: '12', name: 'Size 12', order: 9 },
  { code: '14', name: 'Size 14', order: 10 },
  { code: '16', name: 'Size 16', order: 11 },
];

/**
 * Get all available sizes combined
 * @returns Array of all sizes
 */
export function getAllSizes(): SizeOption[] {
  return [...PREDEFINED_SIZES, ...NUMERIC_SIZES, ...KIDS_SIZES];
}

/**
 * Find size by code
 * @param code Size code
 * @returns SizeOption or undefined
 */
export function findSizeByCode(code: string): SizeOption | undefined {
  return getAllSizes().find(size => size.code.toLowerCase() === code.toLowerCase());
}

/**
 * Validate size code
 * @param code Size code to validate
 * @returns boolean
 */
export function isValidSize(code: string): boolean {
  return findSizeByCode(code) !== undefined;
}

/**
 * Get size codes for dropdown
 * @returns Array of size codes
 */
export function getAllSizeCodes(): string[] {
  return getAllSizes().map(size => size.code);
}

/**
 * Search sizes by query
 * @param query Search query
 * @returns Array of matching sizes
 */
export function searchSizes(query: string): SizeOption[] {
  const searchQuery = query.toLowerCase().trim();
  if (!searchQuery) return getAllSizes();
  
  return getAllSizes().filter(
    size =>
      size.code.toLowerCase().includes(searchQuery) ||
      size.name.toLowerCase().includes(searchQuery)
  );
}

/**
 * Sort sizes by order
 * @param sizes Array of size codes
 * @returns Sorted array of size codes
 */
export function sortSizes(sizes: string[]): string[] {
  const allSizes = getAllSizes();
  return sizes.sort((a, b) => {
    const sizeA = allSizes.find(s => s.code === a);
    const sizeB = allSizes.find(s => s.code === b);
    if (!sizeA || !sizeB) return 0;
    return sizeA.order - sizeB.order;
  });
}
