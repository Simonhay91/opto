// Core models for Optowire product catalog

export interface Image {
  id: string;
  url: string;
  alt?: string;
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
