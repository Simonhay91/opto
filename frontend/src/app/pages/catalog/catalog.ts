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
import { ProductDto, CategoryDto, BrandDto, ProductCriteriaDto } from '../../core/models/models';
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
  brands = signal<BrandDto[]>([]);
  loading = signal(true);
  totalItems = signal(0);
  totalPages = signal(1);

  criteria: ProductCriteriaDto = { page: 1, limit: 24, sortBy: 'newest' };
  searchQuery = '';
  selectedCategoryId = '';
  selectedBrandId = '';
  inStockOnly = false;
  sidebarOpen = false;
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

    // Handle route query params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(p => {
      if (p['q']) { this.searchQuery = p['q']; this.criteria.productName = p['q']; }
    });

    // Apply URL inputs
    if (this.categoryId) { this.selectedCategoryId = this.categoryId; this.criteria.categoryId = this.categoryId; }
    if (this.brandId) { this.selectedBrandId = this.brandId; this.criteria.brandId = this.brandId; }

    // Debounced search
    this.searchSubject.pipe(debounceTime(400), takeUntil(this.destroy$)).subscribe(() => {
      this.criteria.page = 1;
      this.loadProducts();
    });

    this.loadFilters();
    this.loadProducts();
  }

  loadFilters() {
    this.cs.getAll().subscribe({ next: (c: any) => this.categories.set(Array.isArray(c) ? c : c?.items || []), error: () => {} });
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
    return {
      ...this.criteria,
      productName: this.searchQuery || undefined,
      categoryId: this.selectedCategoryId || undefined,
      brandId: this.selectedBrandId || undefined,
      inStock: this.inStockOnly || undefined,
    };
  }

  onSearch() { this.searchSubject.next(this.searchQuery); }

  onCategoryChange(id: string) {
    this.selectedCategoryId = this.selectedCategoryId === id ? '' : id;
    this.criteria.page = 1;
    this.loadProducts();
  }

  onBrandChange(id: string) {
    this.selectedBrandId = this.selectedBrandId === id ? '' : id;
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
    this.selectedCategoryId = '';
    this.selectedBrandId = '';
    this.inStockOnly = false;
    this.criteria = { page: 1, limit: 24, sortBy: 'newest' };
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
