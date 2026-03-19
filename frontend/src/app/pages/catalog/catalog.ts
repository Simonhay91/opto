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
import { ProductCardComponent } from '../../shared/product-card/product-card';
import { ProductDto, CategoryDto, BrandDto } from '../../core/models/models';

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

  // State signals
  products = signal<ProductDto[]>([]);
  categories = signal<CategoryDto[]>([]);
  brands = signal<BrandDto[]>([]);
  attributes = signal<any[]>([]);
  categoryBreadcrumb = signal<CategoryDto[]>([]);
  loading = signal(true);
  selectedCategoryId = signal<number | null>(null);
  selectedCategorySlug = signal<string | null>(null);
  selectedBrandId = signal<number | null>(null);
  selectedAttributes = signal<Record<string | number, string[]>>({});
  currentPage = signal(1);
  totalItems = signal(0);
  totalPages = signal(0);
  sidebarOpen = signal(false);

  // Regular properties (used with ngModel / manual update)
  searchQuery = '';
  sortBy = 'newest';
  readonly limit = 24;

  sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
  ];

  pages = computed(() => {
    const total = this.totalPages();
    if (total <= 1) return [];
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  ngOnInit() {
    this.seo.setPage('Product Catalog', 'Browse our complete catalog of fiber optic and network equipment.');
    this.loadCategories();
    this.loadBrands();

    // Use combineLatest to avoid race condition between paramMap and queryParamMap
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params, queryParams]) => {
      const categorySlug = params.get('categorySlug');
      const search = queryParams.get('q') || queryParams.get('search') || '';

      this.searchQuery = search;
      this.currentPage.set(1);

      if (categorySlug) {
        this.selectedCategorySlug.set(categorySlug);
        this.loadCategoryBySlug(categorySlug);
      } else {
        this.selectedCategorySlug.set(null);
        this.selectedCategoryId.set(null);
        this.categoryBreadcrumb.set([]);
        this.loadCategories();
        this.loadProducts();
      }
    });
  }

  loadCategoryBySlug(slug: string) {
    this.cs.getBySlug(slug).subscribe({
      next: (category) => {
        this.selectedCategoryId.set(Number(category.id));

        // Update SEO with category name
        const catName = category.name || slug;
        this.seo.setPage(
          `${catName} Products`,
          `Browse ${catName} products from Optowire — fiber optic cables, network equipment and more.`
        );
        this.seo.setCatalogSchema(catName, `Product catalog for ${catName}`);

        // Build breadcrumb: if slug has parent (contains '/'), find parent category too
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

        // Show subcategories in sidebar if available
        if (category.children && category.children.length > 0) {
          this.categories.set(category.children);
        }

        this.loadCategoryAttributes(slug);
        this.loadProducts();
      },
      error: () => {
        this.selectedCategoryId.set(null);
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
    const criteria: any = {
      page: this.currentPage(),
      limit: this.limit,
      productName: this.searchQuery || undefined,
      categoryId: this.selectedCategoryId() ?? undefined,
      brands: this.selectedBrandId() ? [this.selectedBrandId()!] : undefined,
      attributes: Object.keys(this.selectedAttributes()).length > 0 ? this.selectedAttributes() : undefined,
      sortBy: this.sortBy !== 'newest' ? this.sortBy : undefined,
    };
    this.ps.explore(criteria).subscribe({
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
      // Child slugs contain '/' prefix (e.g. 'telecommunication/odn-...'), use last segment only
      const urlSlug = category.slug.split('/').pop()!;
      this.router.navigate(['/catalog', urlSlug]);
    }
  }

  onBreadcrumbClick(cat: CategoryDto, _index: number) {
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

  onSortChange(value: string) {
    this.sortBy = value;
    this.loadProducts();
  }

  onBrandChange(brandId: number) {
    this.selectedBrandId.set(this.selectedBrandId() === brandId ? null : brandId);
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
    this.selectedBrandId.set(null);
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
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadProducts();
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
