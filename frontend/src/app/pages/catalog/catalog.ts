import { Component, inject, signal, OnInit, PLATFORM_ID, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { BrandService } from '../../core/services/brand.service';
import { LangService } from '../../core/services/lang.service';
import { SeoService } from '../../core/services/seo.service';
import { TrackingService } from '../../core/services/tracking.service';
import { ProductCardComponent } from '../../shared/product-card/product-card';
import { ProductDto, CategoryDto, BrandDto } from '../../core/models/models';

export interface AttrOption { value: string; label: string; count: number; }
export interface ExtractedAttr { id: number; name: string; options: AttrOption[]; }

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
  private tracking = inject(TrackingService);
  lang = inject(LangService);

  // All loaded products (server page or full category set)
  allProducts = signal<ProductDto[]>([]);
  // Visible on current page after client-side filtering
  products = signal<ProductDto[]>([]);
  categories = signal<CategoryDto[]>([]);
  brands = signal<BrandDto[]>([]);
  // Extracted from loaded products
  extractedAttrs = signal<ExtractedAttr[]>([]);
  categoryBreadcrumb = signal<CategoryDto[]>([]);
  loading = signal(true);
  selectedCategoryId = signal<number | null>(null);
  selectedCategorySlug = signal<string | null>(null);
  // Filters
  selectedBrandIds = signal<number[]>([]);
  selectedAttributes = signal<Record<number, string[]>>({});
  // Pagination
  currentPage = signal(1);
  totalItems = signal(0);
  totalPages = signal(0);
  sidebarOpen = signal(false);
  fullCategoryLoaded = signal(false);
  /** False on parent categories (has children): no spec filters derived from mixed subcategory products */
  showSpecFilters = signal(true);

  searchQuery = '';
  sortBy = 'newest';

  /** Normalize query: strip leading # and trim whitespace */
  private normalizeQuery(q: string): string {
    return q.replace(/^#/, '').trim();
  }

  /** True if query looks like a CRM code (pure digits or short alphanumeric ≤10 chars, no spaces) */
  private isCrmSearch(q: string): boolean {
    const norm = this.normalizeQuery(q);
    return norm.length > 0 && norm.length <= 12 && /^[A-Za-z0-9\-]+$/.test(norm) && !/\s/.test(norm);
  }
  readonly pageSize = 24;

  sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
  ];

  pages = computed(() => {
    const total = this.totalPages();
    if (total <= 1) return [];
    const cur = this.currentPage();
    const all = Array.from({ length: total }, (_, i) => i + 1);
    if (total <= 7) return all;
    const set = new Set([1, total, cur - 1, cur, cur + 1].filter(p => p >= 1 && p <= total));
    return Array.from(set).sort((a, b) => a - b);
  });

  activeFilterCount = computed(() =>
    this.selectedBrandIds().length +
    Object.values(this.selectedAttributes()).reduce((s, v) => s + v.length, 0)
  );

  ngOnInit() {
    this.seo.setPage('Product Catalog', 'Browse our complete catalog of fiber optic and network equipment.');
    this.loadCategories();
    this.loadBrands();

    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params, queryParams]) => {
      const categorySlug = params.get('categorySlug');
      const search = queryParams.get('q') || queryParams.get('search') || '';
      const brandParam = queryParams.get('brand');
      this.searchQuery = search;
      this.currentPage.set(1);
      this.clearFiltersInternal();

      if (brandParam) {
        this.selectedBrandIds.set([Number(brandParam)]);
      }

      if (categorySlug) {
        this.selectedCategorySlug.set(categorySlug);
        this.loadCategoryBySlug(categorySlug);
      } else {
        this.selectedCategorySlug.set(null);
        this.selectedCategoryId.set(null);
        this.categoryBreadcrumb.set([]);
        this.fullCategoryLoaded.set(false);
        this.extractedAttrs.set([]);
        this.showSpecFilters.set(true);
        this.loadCategories();
        // loadFromServer() picks up selectedBrandIds() and passes brandId to API
        this.loadFromServer();
      }
    });
  }

  loadCategoryBySlug(slug: string) {
    this.cs.getBySlug(slug).subscribe({
      next: (category) => {
        this.selectedCategoryId.set(Number(category.id));
        const catName = category.name || slug;
        this.seo.setPage(`${catName} Products`, `Browse ${catName} products from Optowire.`);
        this.seo.setCatalogSchema(catName, `Product catalog for ${catName}`);

        const fullSlug = category.slug || '';
        const slashIdx = fullSlug.lastIndexOf('/');
        if (slashIdx > 0) {
          const parentSlug = fullSlug.substring(0, slashIdx);
          this.cs.getBySlug(parentSlug).subscribe({
            next: (parent) => this.categoryBreadcrumb.set([parent, category]),
            error: () => this.categoryBreadcrumb.set([category])
          });
        } else {
          this.categoryBreadcrumb.set([category]);
        }

        if (category.children && category.children.length > 0) {
          this.categories.set(category.children);
        }

        const isParent = !!(category.children && category.children.length > 0);
        this.showSpecFilters.set(!isParent);
        if (isParent) {
          this.extractedAttrs.set([]);
        }

        // Load all products for category; spec filters only on leaf categories
        this.loadAllCategoryProducts(Number(category.id));
      },
      error: () => {
        this.selectedCategoryId.set(null);
        this.extractedAttrs.set([]);
        this.showSpecFilters.set(true);
        this.loadFromServer();
      }
    });
  }

  /** Load ALL products for a category (paginated internally up to 500) */
  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  loadAllCategoryProducts(categoryId: number) {
    this.loading.set(true);
    this.fullCategoryLoaded.set(false);
    const criteria: any = {
      page: 1,
      limit: 500,
      categoryId,
      productName: (this.searchQuery && !this.isCrmSearch(this.searchQuery))
        ? this.searchQuery : undefined,
    };
    this.ps.explore(criteria).subscribe({
      next: (r: any) => {
        const items: ProductDto[] = r?.products || r?.items || (Array.isArray(r) ? r : []);
        this.allProducts.set(this.shuffle(items));
        this.fullCategoryLoaded.set(true);
        if (this.showSpecFilters()) {
          this.extractAttributes(items);
        } else {
          this.extractedAttrs.set([]);
        }
        this.applyClientFilters();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.allProducts.set([]);
        this.products.set([]);
      }
    });
  }

  /** Standard server-side load (for all-products / search views) */
  loadFromServer() {
    this.loading.set(true);
    this.fullCategoryLoaded.set(false);

    const isCrm = this.isCrmSearch(this.searchQuery);
    const selectedBrands = this.selectedBrandIds();

    const criteria: any = {
      page: isCrm ? 1 : this.currentPage(),
      limit: isCrm ? 500 : this.pageSize,
      // For CRM searches the API won't find by crmCode — load all and filter client-side
      productName: (!isCrm && this.searchQuery) ? this.searchQuery : undefined,
      sortBy: this.sortBy !== 'newest' ? this.sortBy : undefined,
      // Pass single brandId to API for server-side filtering
      brandId: selectedBrands.length === 1 ? selectedBrands[0] : undefined,
    };
    this.ps.explore(criteria).subscribe({
      next: (r: any) => {
        const items: ProductDto[] = r?.products || r?.items || (Array.isArray(r) ? r : []);
        this.allProducts.set(this.shuffle(items));
        if (isCrm) {
          this.fullCategoryLoaded.set(true);
          this.applyClientFilters();
          if (this.searchQuery) this.tracking.trackSearch(this.searchQuery, this.products().length);
        } else {
          this.products.set(this.shuffle(items));
          this.totalItems.set(r?.total || items.length);
          this.totalPages.set(r?.totalPages || Math.ceil((r?.total || items.length) / this.pageSize));
          if (this.searchQuery) this.tracking.trackSearch(this.searchQuery, r?.total || items.length);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.products.set([]);
      }
    });
  }

  /** Kept for compatibility — delegates to loadFromServer */
  loadProducts() {
    if (this.fullCategoryLoaded()) {
      this.applyClientFilters();
    } else {
      this.loadFromServer();
    }
  }

  /** Extract unique SELECTION attributes that are filterable */
  extractAttributes(products: ProductDto[]) {
    const attrMap = new Map<number, { name: string; values: Map<string, number> }>();
    for (const p of products) {
      for (const av of (p as any).attributeValues || []) {
        const attr = av.attribute;
        if (!attr?.isFilterable || attr.type !== 'SELECTION') continue;
        const val: string = (av.textValue || String(av.numericValue ?? '')).trim();
        if (!val || val === 'None' || val === 'null') continue;
        if (!attrMap.has(attr.id)) attrMap.set(attr.id, { name: attr.name.trim(), values: new Map() });
        const vals = attrMap.get(attr.id)!.values;
        vals.set(val, (vals.get(val) || 0) + 1);
      }
    }
    const extracted: ExtractedAttr[] = [];
    attrMap.forEach((v, id) => {
      if (v.values.size > 1) {
        extracted.push({
          id,
          name: v.name,
          options: Array.from(v.values.entries())
            .map(([value, count]) => ({ value, label: value, count }))
            .sort((a, b) => b.count - a.count),
        });
      }
    });
    this.extractedAttrs.set(extracted.slice(0, 10)); // max 10 attrs
  }

  /** Apply selected filters to allProducts → products (client-side) */
  applyClientFilters() {
    const all = this.allProducts();
    const selectedBrands = this.selectedBrandIds();
    const selectedAttrs = this.selectedAttributes();
    const sortBy = this.sortBy;
    const rawSearch = this.searchQuery;
    const search = this.normalizeQuery(rawSearch).toLowerCase();

    let filtered = all.filter(p => {
      if (search) {
        const nameMatch = p.name.toLowerCase().includes(search);
        const crmMatch = ((p as any).crmCode || '').toLowerCase().includes(search);
        const modelMatch = ((p as any).model || '').toLowerCase().includes(search);
        if (!nameMatch && !crmMatch && !modelMatch) return false;
      }
      if (selectedBrands.length > 0) {
        // Products from API don't include brandId — match by brand name prefix in product name
        const brandNames = selectedBrands.map(id => this.getBrandName(id).toLowerCase());
        const nameLC = p.name.toLowerCase();
        const hasMatch = brandNames.some(bn => bn.length > 1 && nameLC.includes(bn));
        if (!hasMatch) return false;
      }
      for (const [attrIdStr, values] of Object.entries(selectedAttrs)) {
        if (!values.length) continue;
        const attrId = Number(attrIdStr);
        const hasMatch = ((p as any).attributeValues || []).some((av: any) =>
          av.attribute?.id === attrId &&
          values.includes((av.textValue || String(av.numericValue ?? '')).trim())
        );
        if (!hasMatch) return false;
      }
      return true;
    });

    // Sort
    if (sortBy === 'price_asc') {
      filtered = filtered.sort((a, b) => this.getPrice(a) - this.getPrice(b));
    } else if (sortBy === 'price_desc') {
      filtered = filtered.sort((a, b) => this.getPrice(b) - this.getPrice(a));
    }

    const total = filtered.length;
    const totalPgs = Math.ceil(total / this.pageSize) || 1;
    const page = Math.min(this.currentPage(), totalPgs);
    this.currentPage.set(page);
    const start = (page - 1) * this.pageSize;
    this.products.set(filtered.slice(start, start + this.pageSize));
    this.totalItems.set(total);
    this.totalPages.set(totalPgs);
  }

  private getPrice(p: ProductDto): number {
    const info = p.pricingInfo as any;
    if (!info) return 0;
    return info.tiers?.[0]?.price || info.basePrice || 0;
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

  navigateToCategory(category: CategoryDto) {
    if (category.slug) {
      const urlSlug = category.slug.split('/').pop()!;
      this.router.navigate(['/catalog', urlSlug]);
    }
  }

  onBreadcrumbClick(cat: CategoryDto, _index: number) {
    if (cat.slug) this.router.navigate(['/catalog', cat.slug]);
  }

  goBackToRoot() { this.router.navigate(['/catalog']); }

  onSearch() {
    this.currentPage.set(1);
    if (this.fullCategoryLoaded()) {
      this.applyClientFilters();
    } else {
      this.loadFromServer();
    }
  }

  onSortChange(value: string) {
    this.sortBy = value;
    this.currentPage.set(1);
    if (this.fullCategoryLoaded()) {
      this.applyClientFilters();
    } else {
      this.loadFromServer();
    }
  }

  onBrandToggle(brandId: number) {
    const cur = this.selectedBrandIds();
    const next = cur.includes(brandId) ? cur.filter(id => id !== brandId) : [...cur, brandId];
    this.selectedBrandIds.set(next);
    this.currentPage.set(1);
    if (this.fullCategoryLoaded()) {
      // Category mode: products already loaded, filter client-side by brand name
      this.applyClientFilters();
    } else {
      // General catalog mode: use server-side brand filter
      this.loadFromServer();
    }
  }

  /** Single-select brand: clicking same brand deselects it */
  onBrandSelect(brandId: number) {
    const cur = this.selectedBrandIds();
    const next = cur.includes(brandId) ? [] : [brandId];
    this.selectedBrandIds.set(next);
    this.currentPage.set(1);
    if (this.fullCategoryLoaded()) {
      this.applyClientFilters();
    } else {
      this.loadFromServer();
    }
  }

  onAttributeChange(attrId: number, value: string, checked: boolean) {
    const cur = { ...this.selectedAttributes() };
    const existing = cur[attrId] || [];
    cur[attrId] = checked ? [...existing, value] : existing.filter(v => v !== value);
    if (!cur[attrId].length) delete cur[attrId];
    this.selectedAttributes.set(cur);
    this.currentPage.set(1);
    this.applyClientFilters();
  }

  isAttrValueSelected(attrId: number, value: string): boolean {
    return this.selectedAttributes()[attrId]?.includes(value) || false;
  }

  removeAttrFilter(attrId: number, value: string) {
    this.onAttributeChange(attrId, value, false);
  }

  removeBrandFilter(brandId: number) {
    this.onBrandToggle(brandId);
  }

  /** Also kept for compatibility */
  onAttributeValueChange(attrId: string | number, value: string, checked: boolean) {
    this.onAttributeChange(Number(attrId), value, checked);
  }

  isAttributeValueSelected(attrId: string | number, value: string): boolean {
    return this.isAttrValueSelected(Number(attrId), value);
  }

  getAttributeValue(attr: any): string { return String(attr.value || attr.id || attr); }
  getAttributeValueLabel(attr: any): string { return attr.label || attr.name || String(attr); }

  private clearFiltersInternal() {
    this.selectedBrandIds.set([]);
    this.selectedAttributes.set({});
  }

  clearFilters() {
    this.clearFiltersInternal();
    this.searchQuery = '';
    this.currentPage.set(1);
    if (this.fullCategoryLoaded()) {
      this.applyClientFilters();
    } else {
      this.loadFromServer();
    }
  }

  clearAttributeFilters() {
    this.selectedAttributes.set({});
    this.selectedBrandIds.set([]);
    this.currentPage.set(1);
    this.applyClientFilters();
  }

  getBrandName(brandId: number): string {
    return this.brands().find(b => (b as any).id === brandId)?.name || String(brandId);
  }

  getAttrName(attrId: number | string): string {
    const id = Number(attrId);
    return this.extractedAttrs().find(a => a.id === id)?.name || String(attrId);
  }

  getSelectedAttributesCount(): number {
    return Object.keys(this.selectedAttributes()).length;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    if (this.fullCategoryLoaded()) {
      this.applyClientFilters();
    } else {
      this.loadFromServer();
      if (isPlatformBrowser(this.platformId)) window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (isPlatformBrowser(this.platformId)) window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
