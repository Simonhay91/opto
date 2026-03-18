import { Component, inject, signal, OnInit, PLATFORM_ID, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { BrandService } from '../../core/services/brand.service';
import { LangService } from '../../core/services/lang.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCardComponent } from '../../shared/product-card/product-card';
import { ProductDto, CategoryDto, BrandDto, ProductCriteriaDto } from '../../core/models/models';

@Component({
  selector: 'app-catalog',
  imports: [CommonModule, FormsModule, RouterLink, ProductCardComponent],
  templateUrl: './catalog.html',
})
export class CatalogComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ps = inject(ProductService);
  private cs = inject(CategoryService);
  private bs = inject(BrandService);
  private seo = inject(SeoService);
  private platformId = inject(PLATFORM_ID);
  lang = inject(LangService);

  products = signal<ProductDto[]>([]);
  categories = signal<CategoryDto[]>([]);
  allCategories = signal<CategoryDto[]>([]);
  brands = signal<BrandDto[]>([]);
  attributes = signal<any[]>([]);
  categoryBreadcrumb = signal<CategoryDto[]>([]);
  
  loading = signal(true);
  selectedCategoryId: number | null = null;
  selectedCategorySlug = signal<string | null>(null);
  selectedBrandId: number | null = null;
  selectedAttributes = signal<Record<string | number, string[]>>({});
  searchQuery = '';
  sortBy = 'newest';
  
  currentPage = signal(1);
  totalItems = signal(0);
  totalPages = signal(0);
  limit = 24;
  sidebarOpen = signal(false);

  sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
  ];
  
  loading = signal(true);
  selectedCategoryId = signal<number | null>(null);
  selectedCategorySlug = signal<string | null>(null);
  selectedBrandId = signal<number | null>(null);
  selectedAttributeValues = signal<Record<string | number, string[]>>({});
  searchQuery = signal<string>('');
  
  currentPage = signal(1);
  totalItems = signal(0);
  totalPages = signal(0);
  limit = 24;
  sidebarOpen = signal(false);

  criteria = computed(() => ({
    page: this.currentPage(),
    limit: this.limit,
    search: this.searchQuery || undefined,
    categories: this.selectedCategoryId ? [this.selectedCategoryId!] : undefined,
    brands: this.selectedBrandId ? [this.selectedBrandId] : undefined,
    attributes: Object.keys(this.selectedAttributes()).length > 0 ? this.selectedAttributes() : undefined,
  }));

  ngOnInit() {
    this.seo.setPage('Product Catalog', 'Browse our complete catalog of fiber optic and network equipment.');
    this.loadCategories();
    this.loadBrands();
    
    // Watch for route params changes
    this.route.paramMap.subscribe(params => {
      const categorySlug = params.get('categorySlug');
      if (categorySlug) {
        this.selectedCategorySlug.set(categorySlug);
        this.loadCategoryBySlug(categorySlug);
      } else {
        this.selectedCategorySlug.set(null);
        this.selectedCategoryId = null);
        this.loadProducts();
      }
    });

    // Watch for query params
    this.route.queryParamMap.subscribe(params => {
      const search = params.get('search');
      if (search) this.searchQuery = search);
    });
  }

  loadCategoryBySlug(slug: string) {
    this.cs.getBySlug(slug).subscribe({
      next: (category) => {
        this.selectedCategoryId = Number(category.id));
        this.breadcrumbs.set([category]); // Simple breadcrumb
        this.loadCategoryAttributes(slug);
        this.loadProducts();
      },
      error: () => {
        this.selectedCategoryId = null);
        this.loadProducts();
      }
    });
  }

  loadCategories() {
    this.cs.getAll().subscribe({
      next: (data) => this.categories.set(data || []),
      error: () => this.categories.set([])
    });
  }

  loadBrands() {
    this.bs.getAll().subscribe({
      next: (data) => this.brands.set(data || []),
      error: () => this.brands.set([])
    });
  }

  loadProducts() {
    this.loading.set(true);
    this.ps.explore(this.criteria()).subscribe({
      next: (r: any) => {
        const items = r?.products || r?.items || (Array.isArray(r) ? r : []);
        this.products.set(items);
        this.totalItems.set(r?.total || items.length);
        this.totalPages.set(r?.totalPages || Math.ceil((r?.total || items.length) / this.limit));
        this.loading.set(false);
      },
      error: () => { 
        this.loading.set(false);
        this.products.set([]);
      }
    });
  }

  loadCategoryAttributes(slug: string) {
    this.cs.getAttributes(slug).subscribe({
      next: (data: any) => {
        const selectionAttrs = (data?.attributes || []).filter((attr: any) => attr.type === 'SELECTION');
        this.attributes.set(selectionAttrs);
      },
      error: () => this.attributes.set([])
    });
  }

  navigateToCategory(category: CategoryDto) {
    if (category.slug) {
      this.router.navigate(['/catalog', category.slug]);
    }
  }

  onBreadcrumbClick(cat: CategoryDto, index: number) {
    if (cat.slug) {
      this.router.navigate(['/catalog', cat.slug]);
    }
  }

  goBackToRoot() {
    this.router.navigate(['/catalog']);
  }

  onSearch() {
    this.currentPage.set(1);
    this.loadProducts();
  }

  onSortChange() {
    this.loadProducts();
  }

  onBrandChange(brandId: number) {
    this.selectedBrandId = this.selectedBrandId === brandId ? null : brandId;
    this.currentPage.set(1);
    this.loadProducts();
  }

  onAttributeValueChange(attrId: string | number, value: string, checked: boolean) {
    const current = { ...this.selectedAttributes() };
    if (!current[attrId]) current[attrId] = [];
    
    if (checked) {
      current[attrId] = [...current[attrId], value];
    } else {
      current[attrId] = current[attrId].filter(v => v !== value);
      if (current[attrId].length === 0) delete current[attrId];
    }
    
    this.selectedAttributes.set(current);
    this.currentPage.set(1);
    this.loadProducts();
  }

  isAttributeValueSelected(attrId: string | number, value: string): boolean {
    return this.selectedAttributes()[attrId]?.includes(value) || false;
  }

  getAttributeValue(attr: any): string {
    return String(attr.value || attr.id || attr);
  }

  getAttributeValueLabel(attr: any): string {
    return attr.label || attr.name || String(attr);
  }

  getSelectedAttributesCount(): number {
    return Object.keys(this.selectedAttributes()).length;
  }

  clearFilters() {
    this.selectedBrandId = null;
    this.selectedAttributes.set({});
    this.searchQuery = '';
    this.currentPage.set(1);
    this.loadProducts();
  }

  clearAttributeFilters() {
    this.selectedAttributes.set({});
    this.currentPage.set(1);
    this.loadProducts();
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadProducts();
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
