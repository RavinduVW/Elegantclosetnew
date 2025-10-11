/**
 * Color Utilities for Product Management
 * Provides predefined colors with hex values
 */

export interface ColorOption {
  name: string;
  hex: string;
  aliases?: string[];
}

export const PREDEFINED_COLORS: ColorOption[] = [
  { name: 'Black', hex: '#000000', aliases: ['black', 'noir'] },
  { name: 'White', hex: '#FFFFFF', aliases: ['white', 'blanc'] },
  { name: 'Gray', hex: '#808080', aliases: ['grey', 'gray', 'gris'] },
  { name: 'Red', hex: '#FF0000', aliases: ['red', 'rouge'] },
  { name: 'Blue', hex: '#0000FF', aliases: ['blue', 'bleu'] },
  { name: 'Green', hex: '#008000', aliases: ['green', 'vert'] },
  { name: 'Yellow', hex: '#FFFF00', aliases: ['yellow', 'jaune'] },
  { name: 'Orange', hex: '#FFA500', aliases: ['orange'] },
  { name: 'Purple', hex: '#800080', aliases: ['purple', 'violet'] },
  { name: 'Pink', hex: '#FFC0CB', aliases: ['pink', 'rose'] },
  { name: 'Brown', hex: '#A52A2A', aliases: ['brown', 'marron'] },
  { name: 'Navy', hex: '#000080', aliases: ['navy', 'navy blue'] },
  { name: 'Teal', hex: '#008080', aliases: ['teal'] },
  { name: 'Maroon', hex: '#800000', aliases: ['maroon'] },
  { name: 'Gold', hex: '#FFD700', aliases: ['gold', 'golden'] },
  { name: 'Silver', hex: '#C0C0C0', aliases: ['silver'] },
  { name: 'Beige', hex: '#F5F5DC', aliases: ['beige', 'cream'] },
  { name: 'Olive', hex: '#808000', aliases: ['olive'] },
  { name: 'Coral', hex: '#FF7F50', aliases: ['coral'] },
  { name: 'Turquoise', hex: '#40E0D0', aliases: ['turquoise'] },
  { name: 'Lavender', hex: '#E6E6FA', aliases: ['lavender'] },
  { name: 'Mint', hex: '#98FF98', aliases: ['mint', 'mint green'] },
  { name: 'Peach', hex: '#FFDAB9', aliases: ['peach'] },
  { name: 'Burgundy', hex: '#800020', aliases: ['burgundy', 'wine'] },
  { name: 'Charcoal', hex: '#36454F', aliases: ['charcoal', 'dark gray'] },
  { name: 'Ivory', hex: '#FFFFF0', aliases: ['ivory', 'off white'] },
  { name: 'Khaki', hex: '#F0E68C', aliases: ['khaki', 'tan'] },
  { name: 'Plum', hex: '#DDA0DD', aliases: ['plum'] },
  { name: 'Salmon', hex: '#FA8072', aliases: ['salmon'] },
  { name: 'Slate', hex: '#708090', aliases: ['slate', 'slate gray'] },
];

/**
 * Find color by name (case-insensitive, includes aliases)
 * @param colorName Name of the color
 * @returns ColorOption or undefined
 */
export function findColorByName(colorName: string): ColorOption | undefined {
  const searchName = colorName.toLowerCase().trim();
  return PREDEFINED_COLORS.find(
    color =>
      color.name.toLowerCase() === searchName ||
      color.aliases?.some(alias => alias.toLowerCase() === searchName)
  );
}

/**
 * Get hex color from color name
 * @param colorName Name of the color
 * @param fallback Fallback hex color (default: #CCCCCC)
 * @returns Hex color code
 */
export function getColorHex(colorName: string, fallback: string = '#CCCCCC'): string {
  const color = findColorByName(colorName);
  return color?.hex || fallback;
}

/**
 * Check if color name is valid
 * @param colorName Name of the color
 * @returns boolean
 */
export function isValidColor(colorName: string): boolean {
  return findColorByName(colorName) !== undefined;
}

/**
 * Get all color names for autocomplete/dropdown
 * @returns Array of color names
 */
export function getAllColorNames(): string[] {
  return PREDEFINED_COLORS.map(color => color.name);
}

/**
 * Search colors by partial name
 * @param query Search query
 * @returns Array of matching colors
 */
export function searchColors(query: string): ColorOption[] {
  const searchQuery = query.toLowerCase().trim();
  if (!searchQuery) return PREDEFINED_COLORS;
  
  return PREDEFINED_COLORS.filter(
    color =>
      color.name.toLowerCase().includes(searchQuery) ||
      color.aliases?.some(alias => alias.toLowerCase().includes(searchQuery))
  );
}

/**
 * Generate a color preview component data
 * @param colors Array of color names
 * @returns Array of color data with hex values
 */
export function generateColorPreviews(colors: string[]): Array<{ name: string; hex: string }> {
  return colors.map(colorName => ({
    name: colorName,
    hex: getColorHex(colorName),
  }));
}
