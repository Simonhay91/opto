import { Component, inject, signal, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { BrandService } from '../../core/services/brand.service';
import { LangService } from '../../core/services/lang.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCardComponent } from '../../shared/product-card/product-card';
import { ProductDto, CategoryDto, BrandDto, ProductCriteriaDto, AttributeDto, CategoryAttributesDto } from '../../core/models/models';
import { SUPPORTED_CATEGORIES, SUPPORTED_CATEGORY_IDS } from '../../core/config/categories.config';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-catalog',
  imports: [CommonModule, RouterLink, FormsModule, ProductCardComponent],
  templateUrl: './catalog.html',
})
export class CatalogComponent implements OnInit, OnDestroy {
  @Input() categoryId?: string;
  @Input() brandId?: string;

  private ps = inject(ProductService);
  private cs = inject(CategoryService);
  private bs = inject(BrandService);
  private seo = inject(SeoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  lang = inject(LangService);

  products = signal<ProductDto[]>([]);
  categories = signal<CategoryDto[]>([]);
  subcategories = signal<CategoryDto[]>([]);
  brands = signal<BrandDto[]>([]);
  attributes = signal<AttributeDto[]>([]);
  loading = signal(true);
  totalItems = signal(0);
  totalPages = signal(1);

  criteria: ProductCriteriaDto = { page: 1, limit: 24, sortBy: 'newest' };
  searchQuery = '';
  selectedCategoryId: number | null = null;
  selectedSubcategoryId: number | null = null;
  selectedBrandId: number | null = null;
  selectedCategorySlug: string | null = null;
  selectedSubcategorySlug: string | null = null;
  selectedAttributes: Map<string | number, string[]> = new Map();
  inStockOnly = false;
  sidebarOpen = false;
  
  // Category navigation
  categoryBreadcrumb: CategoryDto[] = [];
  currentCategoryLevel: CategoryDto[] = [];
  allCategoriesData: CategoryDto[] = [];
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  sortOptions = [
    { value: '', label: 'Default' },
    { value: 'name_asc', label: 'Name A-Z' },
    { value: 'name_desc', label: 'Name Z-A' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
  ];

  ngOnInit() {
    this.seo.setCatalogSchema('Product Catalog', 'Browse fiber optic cables, network equipment, IoT and security solutions.');
    this.seo.setPage('Product Catalog', 'Browse our complete range of fiber optic cables, network equipment, IoT and security solutions from Optowire.');

    // Load filters first
    this.loadFilters();

    // Handle route query params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(p => {
      let shouldReload = false;
      
      if (p['q']) { 
        this.searchQuery = p['q']; 
        this.criteria.productName = p['q']; 
        shouldReload = true;
      }
      if (p['category']) { 
        // Convert to number for proper comparison
        this.selectedCategoryId = parseInt(p['category'], 10);
        // Find category slug for loading attributes
        const category = SUPPORTED_CATEGORIES.find(c => c.id === this.selectedCategoryId);
        if (category?.slug) {
          this.selectedCategorySlug = category.slug;
          this.loadCategoryAttributes(category.slug);
        }
        shouldReload = true;
      }
      if (p['brand']) {
        this.selectedBrandId = parseInt(p['brand'], 10);
        shouldReload = true;
      }
      
      if (shouldReload) {
        this.criteria.page = 1;
        this.loadProducts();
      }
    });

    // Apply URL inputs (from route params)
    if (this.categoryId) { 
      this.selectedCategoryId = typeof this.categoryId === 'string' ? parseInt(this.categoryId, 10) : this.categoryId;
    }
    if (this.brandId) { 
      this.selectedBrandId = typeof this.brandId === 'string' ? parseInt(this.brandId, 10) : this.brandId;
    }

    // Debounced search
    this.searchSubject.pipe(debounceTime(400), takeUntil(this.destroy$)).subscribe(() => {
      this.criteria.page = 1;
      this.loadProducts();
    });

    // Initial load if no query params triggered it
    this.loadProducts();
  }

  // Supported categories with icons
  supportedCategories = SUPPORTED_CATEGORIES;

  loadFilters() {
    // Load full categories from API to get children
    this.cs.getAll().subscribe({
      next: (allCategories: any) => {
        const categoriesArray = Array.isArray(allCategories) ? allCategories : allCategories?.items || [];
        
        // Save all categories for navigation
        this.allCategoriesData = categoriesArray;
        
        // Filter to only supported categories for initial display
        const supportedCats = categoriesArray
          .filter((c: any) => SUPPORTED_CATEGORY_IDS.includes(c.id))
          .map((c: any) => {
            const config = SUPPORTED_CATEGORIES.find(sc => sc.id === c.id);
            return {
              ...c,
              icon: config?.icon // Add icon from config
            };
          });
        
        this.currentCategoryLevel = supportedCats;
        this.categories.set(supportedCats);
      },
      error: () => {
        // Fallback to config categories without children
        const fallback = SUPPORTED_CATEGORIES.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: c.icon
        } as CategoryDto));
        this.currentCategoryLevel = fallback;
        this.categories.set(fallback);
      }
    });
    
    this.bs.getAll().subscribe({ next: (b: any) => this.brands.set(Array.isArray(b) ? b : b?.items || []), error: () => {} });
  }

  loadProducts() {
    this.loading.set(true);
    this.ps.explore(this.buildCriteria()).subscribe({
      next: (r: any) => {
        const items = r?.items || r?.products || (Array.isArray(r) ? r : []);
        this.products.set(items);
        this.totalItems.set(r?.total || items.length);
        this.totalPages.set(r?.totalPages || Math.ceil((r?.total || items.length) / (this.criteria.limit || 24)));
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.products.set([]); }
    });
  }

  buildCriteria(): ProductCriteriaDto {
    const criteria: ProductCriteriaDto = {
      ...this.criteria,
      productName: this.searchQuery || undefined,
      inStock: this.inStockOnly || undefined,
    };
    
    // Use subcategory if selected, otherwise use main category
    if (this.selectedSubcategoryId !== null) {
      (criteria as any).categoryId = this.selectedSubcategoryId;
    } else if (this.selectedCategoryId !== null) {
      (criteria as any).categoryId = this.selectedCategoryId;
    }
    
    // Add brandId if selected
    if (this.selectedBrandId !== null) {
      (criteria as any).brandId = this.selectedBrandId;
    }

    // Add selected attribute values
    if (this.selectedAttributes.size > 0) {
      criteria.selectionAttributeValues = Array.from(this.selectedAttributes.entries()).map(([id, values]) => ({
        id,
        values
      }));
    }
    
    return criteria;
  }

  loadCategoryAttributes(slug: string) {
    this.cs.getAttributes(slug).subscribe({
      next: (data: CategoryAttributesDto) => {
        // Get subcategories from main categories list
        if (this.selectedCategoryId !== null) {
          const mainCategory = this.categories().find(c => c.id === this.selectedCategoryId);
          if (mainCategory?.children && mainCategory.children.length > 0) {
            this.subcategories.set(mainCategory.children);
          } else {
            this.subcategories.set([]);
          }
        }
        
        // Filter only SELECTION type attributes
        const selectionAttrs = (data.attributes || []).filter(attr => attr.type === 'SELECTION');
        this.attributes.set(selectionAttrs);
      },
      error: () => {
        this.subcategories.set([]);
        this.attributes.set([]);
      }
    });
  }

  onAttributeValueChange(attrId: string | number, value: string, checked: boolean) {
    if (checked) {
      // Add value to selected attributes
      const current = this.selectedAttributes.get(attrId) || [];
      if (!current.includes(value)) {
        this.selectedAttributes.set(attrId, [...current, value]);
      }
    } else {
      // Remove value from selected attributes
      const current = this.selectedAttributes.get(attrId) || [];
      const filtered = current.filter(v => v !== value);
      if (filtered.length > 0) {
        this.selectedAttributes.set(attrId, filtered);
      } else {
        this.selectedAttributes.delete(attrId);
      }
    }
    
    // Reload products with new filters
    this.criteria.page = 1;
    this.loadProducts();
  }

  isAttributeValueSelected(attrId: string | number, value: string): boolean {
    return this.selectedAttributes.get(attrId)?.includes(value) || false;
  }

  clearAttributeFilters() {
    this.selectedAttributes.clear();
    this.criteria.page = 1;
    this.loadProducts();
  }

  onSearch() { this.searchSubject.next(this.searchQuery); }

  onCategoryChange(id: number | string) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    this.selectedCategoryId = this.selectedCategoryId === numId ? null : numId;
    
    // Reset subcategory selection when changing main category
    this.selectedSubcategoryId = null;
    this.selectedSubcategorySlug = null;
    
    // Load attributes for the selected category
    if (this.selectedCategoryId !== null) {
      const category = SUPPORTED_CATEGORIES.find(c => c.id === this.selectedCategoryId);
      if (category?.slug) {
        this.selectedCategorySlug = category.slug;
        this.loadCategoryAttributes(category.slug);
      }
    } else {
      // Clear everything when no category selected
      this.selectedCategorySlug = null;
      this.subcategories.set([]);
      this.attributes.set([]);
      this.selectedAttributes.clear();
    }
    
    this.criteria.page = 1;
    this.loadProducts();
  }

  navigateToCategory(category: CategoryDto) {
    // Add to breadcrumb if not already there
    const existingIndex = this.categoryBreadcrumb.findIndex(c => c.id === category.id);
    if (existingIndex >= 0) {
      // User clicked on breadcrumb - go back to that level
      this.categoryBreadcrumb = this.categoryBreadcrumb.slice(0, existingIndex + 1);
    } else {
      // User navigated deeper
      this.categoryBreadcrumb.push(category);
    }
    
    // Set current selection
    this.selectedCategoryId = category.id as number;
    this.selectedCategorySlug = category.slug || null;
    
    // Show children of this category as current level
    if (category.children && category.children.length > 0) {
      this.currentCategoryLevel = category.children;
      this.categories.set(category.children);
    } else {
      // No children - load from API
      this.findAndSetCategoryChildren(category.id);
    }
    
    // Load attributes for this category
    if (category.slug) {
      this.loadCategoryAttributes(category.slug);
    }
    
    // Reload products
    this.criteria.page = 1;
    this.loadProducts();
  }

  findAndSetCategoryChildren(categoryId: string | number) {
    // Search for category in all data and set its children
    const findCategory = (cats: CategoryDto[]): CategoryDto | null => {
      for (const cat of cats) {
        if (cat.id === categoryId) return cat;
        if (cat.children && cat.children.length > 0) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const category = findCategory(this.allCategoriesData);
    if (category && category.children && category.children.length > 0) {
      this.currentCategoryLevel = category.children;
      this.categories.set(category.children);
    } else {
      this.currentCategoryLevel = [];
      this.categories.set([]);
    }
  }

  goBackToRoot() {
    // Reset to main categories
    this.categoryBreadcrumb = [];
    this.selectedCategoryId = null;
    this.selectedSubcategoryId = null;
    this.selectedCategorySlug = null;
    this.selectedSubcategorySlug = null;
    this.selectedAttributes.clear();
    this.attributes.set([]);
    
    // Show main supported categories
    const supportedCats = this.allCategoriesData
      .filter((c: any) => SUPPORTED_CATEGORY_IDS.includes(c.id))
      .map((c: any) => {
        const config = SUPPORTED_CATEGORIES.find(sc => sc.id === c.id);
        return {
          ...c,
          icon: config?.icon
        };
      });
    
    this.currentCategoryLevel = supportedCats;
    this.categories.set(supportedCats);
    
    // Reload products
    this.criteria.page = 1;
    this.loadProducts();
  }

  onBreadcrumbClick(category: CategoryDto, index: number) {
    // Remove all categories after this one
    this.categoryBreadcrumb = this.categoryBreadcrumb.slice(0, index + 1);
    
    // Navigate to this category
    this.selectedCategoryId = category.id as number;
    this.selectedCategorySlug = category.slug || null;
    
    // Show its children
    if (category.children && category.children.length > 0) {
      this.currentCategoryLevel = category.children;
      this.categories.set(category.children);
    } else {
      this.findAndSetCategoryChildren(category.id);
    }
    
    // Load attributes
    if (category.slug) {
      this.loadCategoryAttributes(category.slug);
    }
    
    // Reload products
    this.criteria.page = 1;
    this.loadProducts();
  }

  onSubcategoryChange(subcategory: CategoryDto) {
    // Toggle subcategory selection
    if (this.selectedSubcategoryId === subcategory.id) {
      this.selectedSubcategoryId = null;
      this.selectedSubcategorySlug = null;
      // Load parent category attributes
      if (this.selectedCategorySlug) {
        this.loadCategoryAttributes(this.selectedCategorySlug);
      }
    } else {
      this.selectedSubcategoryId = subcategory.id as number;
      this.selectedSubcategorySlug = subcategory.slug || null;
      // Load subcategory attributes
      if (subcategory.slug) {
        this.loadCategoryAttributes(subcategory.slug);
      }
    }
    
    this.criteria.page = 1;
    this.loadProducts();
  }

  onBrandChange(id: number) {
    this.selectedBrandId = this.selectedBrandId === id ? null : id;
    this.criteria.page = 1;
    this.loadProducts();
  }

  onSortChange(val: string) {
    this.criteria.sortBy = val;
    this.criteria.page = 1;
    this.loadProducts();
  }

  onStockChange() {
    this.inStockOnly = !this.inStockOnly;
    this.criteria.page = 1;
    this.loadProducts();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategoryId = null;
    this.selectedSubcategoryId = null;
    this.selectedBrandId = null;
    this.selectedCategorySlug = null;
    this.selectedSubcategorySlug = null;
    this.inStockOnly = false;
    this.selectedAttributes.clear();
    this.subcategories.set([]);
    this.attributes.set([]);
    this.criteria = { page: 1, limit: 24, sortBy: 'newest' };
    this.router.navigate(['/catalog']);
    this.loadProducts();
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.criteria.page = p;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pages(): number[] {
    const total = this.totalPages();
    const current = this.criteria.page || 1;
    const range: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}
