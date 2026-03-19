import { Component, inject, signal, HostListener, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { LangService } from '../../core/services/lang.service';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuoteModalComponent } from '../quote-modal/quote-modal';
import { CartModalComponent } from '../cart-modal/cart-modal';
import { getImageUrl, ProductDto } from '../../core/models/models';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, QuoteModalComponent, CartModalComponent],
  templateUrl: './header.html',
  styles: [`
    :host { display: block; }
    .nav-link { @apply text-sm font-medium transition-colors duration-200; }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  theme = inject(ThemeService);
  lang = inject(LangService);
  cart = inject(CartService);
  private ps = inject(ProductService);
  private router = inject(Router);
  private elRef = inject(ElementRef);

  partnerName = signal('Optowire');
  partnerLogo = signal('/assets/images/optowire-logo.png');
  scrolled = signal(false);
  menuOpen = signal(false);
  searchQuery = signal('');
  mobileSearchOpen = signal(false);
  quoteOpen = signal(false);
  cartOpen = signal(false);

  // Search-as-you-type
  searchResults = signal<ProductDto[]>([]);
  searchLoading = signal(false);
  showDropdown = signal(false);
  private searchInput$ = new Subject<string>();

  navLinks = [
    { key: 'home', path: '/' },
    { key: 'catalog', path: '/catalog' },
    { key: 'blog', path: '/blog' },
    { key: 'faq', path: '/faq' },
    { key: 'about', path: '/about' },
    { key: 'contact', path: '/contact' },
  ];

  ngOnInit() {
    this.searchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.trim().length < 2) {
          this.searchResults.set([]);
          this.showDropdown.set(false);
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

  closeDropdown() {
    this.showDropdown.set(false);
  }

  selectProduct(product: ProductDto) {
    this.router.navigate(['/product', product.slug || product.id]);
    this.closeDropdown();
    this.searchQuery.set('');
    this.menuOpen.set(false);
  }

  getProductImage(product: ProductDto): string {
    const mainImg = product.images?.find(i => i.id === product.mainImageId) || product.images?.[0];
    return getImageUrl(mainImg, 'thumb') || '/assets/no-image.png';
  }

  search() {
    if (this.searchQuery().trim()) {
      this.router.navigate(['/catalog'], { queryParams: { q: this.searchQuery() } });
      this.closeDropdown();
      this.mobileSearchOpen.set(false);
      this.searchQuery.set('');
    }
  }

  onSearchKey(e: KeyboardEvent) {
    if (e.key === 'Enter') this.search();
    if (e.key === 'Escape') this.closeDropdown();
  }

  ngOnDestroy() {
    this.searchInput$.complete();
  }
}
