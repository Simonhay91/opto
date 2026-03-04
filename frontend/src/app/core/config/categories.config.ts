// Supported categories configuration
export interface CategoryConfig {
  id: number;
  slug: string;
  name: string;
  icon: string;
}

export const SUPPORTED_CATEGORIES: CategoryConfig[] = [
  {
    id: 1,
    slug: 'telecommunication',
    name: 'Telecommunication',
    icon: '/assets/images/telecom.webp'
  },
  {
    id: 91,
    slug: 'network-equipments',
    name: 'Network Equipments',
    icon: '/assets/images/network.webp'
  },
  {
    id: 188,
    slug: 'security-systems',
    name: 'Security Systems',
    icon: '/assets/images/security.webp'
  },
  {
    id: 212,
    slug: 'iot',
    name: 'IoT',
    icon: '/assets/images/iot.webp'
  }
];

// Helper to check if category is supported
export function isSupportedCategory(categoryId: number | string): boolean {
  const id = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
  return SUPPORTED_CATEGORIES.some(c => c.id === id);
}

// Helper to get category config
export function getCategoryConfig(categoryId: number | string): CategoryConfig | undefined {
  const id = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
  return SUPPORTED_CATEGORIES.find(c => c.id === id);
}

// Supported category IDs for API filtering
export const SUPPORTED_CATEGORY_IDS = SUPPORTED_CATEGORIES.map(c => c.id);
