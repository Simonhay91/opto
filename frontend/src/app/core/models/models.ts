// Core models for Optowire product catalog

// Base URL for images from the API
export const API_IMAGE_BASE = 'https://dev.planetworkspace.com/';

export interface Image {
  id: number | string;
  url?: string;
  path?: string;
  optimizedPath?: string;
  path128px?: string;
  path160px?: string;
  path208px?: string;
  path636px?: string;
  path1092px?: string;
  filename?: string;
  alt?: string;
}

// Helper to get image URL from various path formats
export function getImageUrl(img: Image | undefined, size: 'thumb' | 'medium' | 'large' | 'full' = 'medium'): string {
  if (!img) return '/assets/no-image.png';
  
  // If url is already provided, use it
  if (img.url) return img.url;
  
  // Select path based on size
  let path: string | undefined;
  switch (size) {
    case 'thumb':
      path = img.path160px || img.path128px || img.path208px;
      break;
    case 'medium':
      path = img.path636px || img.path208px || img.optimizedPath;
      break;
    case 'large':
      path = img.path1092px || img.path636px || img.optimizedPath;
      break;
    case 'full':
      path = img.optimizedPath || img.path;
      break;
  }
  
  // Fallback to any available path
  if (!path) {
    path = img.optimizedPath || img.path636px || img.path208px || img.path;
  }
  
  if (!path) return '/assets/no-image.png';
  
  // Add public/ prefix if path doesn't already have it
  if (!path.startsWith('public/') && !path.startsWith('http')) {
    path = `public/${path}`;
  }
  
  // Build full URL
  return `${API_IMAGE_BASE}${path}`;
}

export interface PricingTier {
  minQty: number;
  maxQty?: number;
  price: number;
  currency?: string;
}

export interface PricingInfo {
  tiers?: PricingTier[];
  basePrice?: number;
  currency?: string;
  discountPercent?: number;
}

export interface AttributeValue {
  id: string;
  value: string;
  label?: string;
}

export interface Attribute {
  id: string;
  name: string;
  values: AttributeValue[];
}

export interface ProductDto {
  id?: string;
  slug?: string;
  name: string;
  model?: string;
  crmCode?: string;
  description?: string;
  images?: Image[];
  mainImageId?: string;
  stockAmount?: number;
  isHot?: boolean;
  isDiscontinued?: boolean;
  isNew?: boolean;
  pricingInfo?: PricingInfo;
  attributes?: Attribute[];
  categoryId?: string;
  brandId?: string;
  brandName?: string;
  categoryName?: string;
}

export interface ProductCriteriaDto {
  productName?: string;
  categoryId?: string;
  brandId?: string;
  collectionId?: string;
  page?: number;
  limit?: number;
  inStock?: boolean;
  onWay?: boolean;
  sortBy?: string;
  selectionAttributeValues?: string[];
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug?: string;
  image?: string;
  parentId?: string;
  children?: CategoryDto[];
  productCount?: number;
}

export interface BrandDto {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  description?: string;
}

export interface SliderDto {
  id: string;
  title?: string;
  subtitle?: string;
  image?: string;
  imageUrl?: string;
  link?: string;
  buttonText?: string;
}

export interface PartnerDto {
  id?: string;
  name: string;
  email?: string;
  url?: string;
  partnerKey?: string;
  isActive?: boolean;
  logoImage?: string;
  flagImage?: string;
  socials?: { platform: string; url: string }[];
  vat?: string;
  defaultDiscountLevel?: number;
}

export interface SectionDto {
  id: string;
  name: string;
  order?: number;
}
