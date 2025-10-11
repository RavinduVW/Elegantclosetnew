export interface HeaderProps {
  className?: string;
}

export interface Category {
  name: string;
  href: string;
}

export interface CategoryItem {
  name: string;
  href: string;
}

export interface HeaderState {
  isScrolled: boolean;
  isMobileMenuOpen: boolean;
  isCategoriesOpen: boolean;
}

export type HeaderMode = 'expanded' | 'compact';
