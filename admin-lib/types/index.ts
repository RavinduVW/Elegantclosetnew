import { Timestamp } from "firebase/firestore";

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  markdownDescription?: string;
  shortDescription?: string;
  introduction?: string;
  sku: string;
  price: number;
  salePrice?: number;
  discountPercentage?: number;
  compareAtPrice?: number;
  costPrice?: number;
  currency: string;

  inStock: boolean;
  isSoldOut: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  allowBackorder: boolean;

  categoryId: string;
  subCategoryId?: string;
  secondaryCategories?: string[];
  tags: string[];

  colors: string[];
  sizes: string[];
  customSizes?: string[];
  material?: string;
  brand?: string;

  images: ProductImage[];
  featuredImage: string;

  hasVariants: boolean;
  variants?: ProductVariant[];

  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "in";
  };

  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];

  status: "draft" | "published" | "archived";
  featured: boolean;
  specialTag?: "new" | "trending" | "bestseller" | "limited" | null;
  visibility: "public" | "private" | "password";

  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  publishedAt?: Timestamp;

  viewCount?: number;
  salesCount?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  alt: string;
  order: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price?: number;
  inStock: boolean;
  stockQuantity?: number;
  attributes: {
    [key: string]: string;
  };
  image?: string;
}

export interface ProductFilters {
  status?: string;
  categoryId?: string;
  featured?: boolean;
  inStock?: boolean;
  limit?: number;
  searchQuery?: string;
}

// ============================================================================
// CATEGORY TYPES
// ============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string; // For sub-categories (null = main category)
  
  // Sub-categories (for main categories only)
  subCategories?: SubCategory[];

  // Media (ImageBB hosted)
  image?: string;
  icon?: string;

  // Display
  order: number;
  showInMenu: boolean; // Only main categories show in header menu
  menuLabel?: string;

  // SEO
  seoTitle?: string;
  seoDescription?: string;

  // Status
  status: "active" | "inactive";

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  productCount?: number;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  parentCategoryId: string;
  description?: string;
  image?: string;
  order: number;
  status: "active" | "inactive";
  productCount?: number;
}

// ============================================================================
// CONTENT TYPES
// ============================================================================

export interface ContentBlock {
  id: string;
  type: "hero" | "text" | "image" | "gallery" | "products" | "testimonial" | "cta" | "custom";
  page: string;
  order: number;

  content: {
    title?: string;
    subtitle?: string;
    text?: string;
    image?: string;
    images?: string[];
    buttonText?: string;
    buttonLink?: string;
    backgroundColor?: string;
    textColor?: string;
    alignment?: "left" | "center" | "right";
    productIds?: string[];
    customHtml?: string;
    [key: string]: any;
  };

  visible: boolean;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// SITE SETTINGS TYPES
// ============================================================================

export interface SiteSettings {
  id: "global";

  // General
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  supportEmail: string;

  // Branding
  logo: string;
  logoLight?: string;
  favicon: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };

  // Contact
  phone?: string;
  address?: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    pinterest?: string;
    youtube?: string;
  };

  // Features
  enableBlog: boolean;
  enableReviews: boolean;
  enableWishlist: boolean;
  enableCompareProducts: boolean;

  // E-commerce
  currency: string;
  currencySymbol: string;
  taxRate?: number;
  shippingMethods?: ShippingMethod[];
  paymentMethods?: PaymentMethod[];

  // SEO
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;

  // Policies
  termsUrl?: string;
  privacyUrl?: string;
  returnPolicyUrl?: string;

  updatedAt: Timestamp;
  updatedBy: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays?: string;
  enabled: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: "card" | "bank_transfer" | "cash_on_delivery" | "paypal" | "other";
  enabled: boolean;
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export interface NavigationMenu {
  id: string;
  location: "header" | "footer" | "mobile";
  items: NavigationItem[];
  updatedAt: Timestamp;
}

export interface NavigationItem {
  id: string;
  label: string;
  type: "link" | "category" | "page" | "custom";
  url?: string;
  categoryId?: string;
  page?: string;
  order: number;
  openInNewTab: boolean;
  children?: NavigationItem[];
  icon?: string;
  visible: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// ============================================================================
// MEDIA TYPES
// ============================================================================

export interface Media {
  id: string;
  filename: string;
  originalFilename: string;
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
  uploadedBy: string;
  uploadedAt: Timestamp;
  usedIn?: string[];
  tags?: string[];
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export interface Order {
  id: string;
  orderNumber: string;

  // Customer
  customerId?: string;
  customerEmail: string;
  customerName: string;

  // Items
  items: OrderItem[];

  // Pricing
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;

  // Shipping
  shippingAddress: Address;
  billingAddress?: Address;
  shippingMethod: string;
  trackingNumber?: string;

  // Payment
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paidAt?: Timestamp;

  // Status
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";

  // Notes
  customerNote?: string;
  adminNote?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
}

export interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

// ============================================================================
// ADMIN USER TYPES
// ============================================================================

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: "super_admin" | "admin" | "editor" | "viewer";
  avatar?: string;

  permissions: {
    products: Permission;
    categories: Permission;
    content: Permission;
    media: Permission;
    orders: Permission;
    settings: Permission;
    users: Permission;
  };

  active: boolean;
  lastLogin?: Timestamp;

  createdAt: Timestamp;
  createdBy: string;
}

export type Permission = "none" | "read" | "write" | "admin";

// ============================================================================
// ADMIN LOG TYPES
// ============================================================================

export interface AdminLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  timestamp: Timestamp;
  ipAddress?: string;
}

export interface AboutContent {
  id: string;
  content: string;
  images: Array<{
    url: string;
    alt: string;
    caption?: string;
  }>;
  seoTitle?: string;
  seoDescription?: string;
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  updatedBy: string;
}

export interface ContactSettings {
  id: "global";
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  phoneNumbers: PhoneNumber[];
  email: string;
  businessHours: BusinessHours[];
  socialMedia: {
    facebook?: string;
    instagram?: string;
  };
  updatedAt: Timestamp;
  updatedBy: string;
}

export interface PhoneNumber {
  id: string;
  label: string;
  number: string;
  primary: boolean;
}

export interface BusinessHours {
  id: string;
  day: string;
  openTime: string;
  closeTime: string;
  closed: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  priority: "low" | "medium" | "high";
  tags?: string[];
  adminNotes?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  readAt?: Timestamp;
  readBy?: string;
  repliedAt?: Timestamp;
}

export interface HeroSettings {
  id: "global";
  activeVersion: "carousel" | "grid";
  carouselImages: HeroImage[];
  gridImages: HeroGridImage[];
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  autoPlayInterval: number;
  showArrows: boolean;
  showDots: boolean;
  updatedAt: Timestamp;
  updatedBy: string;
}

export interface HeroImage {
  id: string;
  url: string;
  alt: string;
  order: number;
  mobileUrl?: string;
}

export interface HeroGridImage {
  id: string;
  url: string;
  alt: string;
  position: 1 | 2 | 3 | 4;
}
