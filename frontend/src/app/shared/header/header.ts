import { Component, inject, signal, HostListener, OnInit, OnDestroy, ElementRef, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { LangService } from '../../core/services/lang.service';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartModalComponent } from '../cart-modal/cart-modal';
import { getImageUrl, ProductDto, CategoryDto } from '../../core/models/models';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

const RECENT_KEY = 'optowire_recent_searches';
const MAX_RECENT = 5;

const CATEGORY_ICONS: Record<string, string> = {
  'telecommunication': '/assets/images/optowireCategories/telecom.svg',
  'network-equipment': '/assets/images/optowireCategories/network.svg',
  'security-systems': '/assets/images/optowireCategories/security.svg',
  'iot': '/assets/images/optowireCategories/iot.svg',
};

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, CartModalComponent],
  templateUrl: './header.html',
  styles: [`
    :host { display: block; }
    .mega-menu { animation: megaSlide 0.18s ease forwards; }
    @keyframes megaSlide {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  theme = inject(ThemeService);
  lang = inject(LangService);
  cart = inject(CartService);
  private ps = inject(ProductService);
  private cs = inject(CategoryService);
  private router = inject(Router);
  private elRef = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);

  partnerName = signal('Optowire');
  partnerLogo = signal('/assets/images/optowire-logo.png');
  scrolled = signal(false);
  menuOpen = signal(false);
  searchQuery = signal('');
  mobileSearchOpen = signal(false);
  cartOpen = signal(false);
  megaMenuOpen = signal(false);
  mobileProductsOpen = signal(false);
  navCategories = signal<CategoryDto[]>([]);
  private megaTimer: any = null;

  // Search-as-you-type
  searchResults = signal<ProductDto[]>([]);
  searchLoading = signal(false);
  showDropdown = signal(false);
  recentSearches = signal<string[]>([]);
  private searchInput$ = new Subject<string>();

  navLinks = [
    { key: 'blog', path: '/blog' },
    { key: 'faq', path: '/faq' },
    { key: 'about', path: '/about' },
    { key: 'contact', path: '/contact' },
  ];

  ngOnInit() {
    this.loadRecentSearches();
    this.loadNavCategories();

    this.searchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.trim().length < 2) {
          this.searchResults.set([]);
          this.showDropdown.set(query.trim().length === 0 && this.recentSearches().length > 0);
          this.searchLoading.set(false);
          return of(null);
        }
        this.searchLoading.set(true);
        return this.ps.explore({ productName: query, page: 1, limit: 6 });
      })
    ).subscribe({
      next: (r: any) => {
        if (!r) return;
        const items: ProductDto[] = r?.products || r?.items || (Array.isArray(r) ? r : []);
        this.searchResults.set(items.slice(0, 6));
        this.showDropdown.set(true);
        this.searchLoading.set(false);
      },
      error: () => {
        this.searchResults.set([]);
        this.searchLoading.set(false);
      }
    });
  }

  loadNavCategories() {
    this.cs.getAll().subscribe({
      next: (cats) => this.navCategories.set(cats || []),
      error: () => {}
    });
  }

  getCategoryIcon(slug: string): string {
    return CATEGORY_ICONS[slug] || '';
  }

  getCategoryRoute(cat: CategoryDto): string[] {
    return ['/catalog', cat.slug || String(cat.id)];
  }

  getSubcategoryRoute(sub: CategoryDto): string[] {
    const slug = (sub.slug || '').split('/').pop() || String(sub.id);
    return ['/catalog', slug];
  }

  onProductsEnter() {
    clearTimeout(this.megaTimer);
    this.megaTimer = setTimeout(() => this.megaMenuOpen.set(true), 60);
  }

  onProductsLeave() {
    clearTimeout(this.megaTimer);
    this.megaTimer = setTimeout(() => this.megaMenuOpen.set(false), 120);
  }

  closeMegaMenu() {
    clearTimeout(this.megaTimer);
    this.megaMenuOpen.set(false);
  }

  countSubs = (acc: number, cat: CategoryDto) => acc + (cat.children?.length || 0);

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set(window.scrollY > 20); }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.elRef.nativeElement.contains(e.target)) {
      this.closeDropdown();
    }
  }

  onSearchInput(value: string) {
    this.searchQuery.set(value);
    this.searchInput$.next(value);
    if (value.trim().length < 2) this.closeDropdown();
  }

  onSearchFocus() {
    if (!this.searchQuery().trim() && this.recentSearches().length > 0) {
      this.showDropdown.set(true);
    }
  }

  closeDropdown() {
    this.showDropdown.set(false);
  }

  selectProduct(product: ProductDto) {
    const slug = product.slug || String(product.id);
    this.router.navigate(['/product', ...slug.split('/')]);
    this.closeDropdown();
    this.searchQuery.set('');
    this.menuOpen.set(false);
  }

  getProductImage(product: ProductDto): string {
    const mainImg = product.images?.find(i => i.id === product.mainImageId) || product.images?.[0];
    return getImageUrl(mainImg, 'thumb') || '/assets/no-image.png';
  }

  search() {
    const q = this.searchQuery().trim();
    if (q) {
      this.saveRecentSearch(q);
      this.router.navigate(['/catalog'], { queryParams: { q } });
      this.closeDropdown();
      this.mobileSearchOpen.set(false);
      this.searchQuery.set('');
    }
  }

  selectRecentSearch(term: string) {
    this.searchQuery.set(term);
    this.saveRecentSearch(term);
    this.router.navigate(['/catalog'], { queryParams: { q: term } });
    this.closeDropdown();
    this.searchQuery.set('');
    this.menuOpen.set(false);
  }

  removeRecentSearch(term: string, e: MouseEvent) {
    e.stopPropagation();
    const updated = this.recentSearches().filter(s => s !== term);
    this.recentSearches.set(updated);
    this.saveToStorage(updated);
    if (!updated.length) this.closeDropdown();
  }

  clearRecentSearches(e: MouseEvent) {
    e.stopPropagation();
    this.recentSearches.set([]);
    if (isPlatformBrowser(this.platformId)) localStorage.removeItem(RECENT_KEY);
    this.closeDropdown();
  }

  private saveRecentSearch(term: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    const updated = [term, ...this.recentSearches().filter(s => s !== term)].slice(0, MAX_RECENT);
    this.recentSearches.set(updated);
    this.saveToStorage(updated);
  }

  private loadRecentSearches() {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      this.recentSearches.set(raw ? JSON.parse(raw) : []);
    } catch { this.recentSearches.set([]); }
  }

  private saveToStorage(items: string[]) {
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(items)); } catch {}
  }

  onSearchKey(e: KeyboardEvent) {
    if (e.key === 'Enter') this.search();
    if (e.key === 'Escape') this.closeDropdown();
  }

  ngOnDestroy() {
    this.searchInput$.complete();
    clearTimeout(this.megaTimer);
  }
}
