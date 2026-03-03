import { Component, inject, signal, HostListener, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, QuoteModalComponent, CartModalComponent],
  templateUrl: './header.html',
  styles: [`
    :host { display: block; }
    .nav-link { @apply text-sm font-medium transition-colors duration-200; }
  `]
})
export class HeaderComponent implements OnInit {
  theme = inject(ThemeService);
  lang = inject(LangService);
  cart = inject(CartService);
  private ps = inject(ProductService);
  private router = inject(Router);

  partnerName = signal('Optowire');
  partnerLogo = signal('');
  scrolled = signal(false);
  menuOpen = signal(false);
  searchQuery = signal('');
  mobileSearchOpen = signal(false);
  quoteOpen = signal(false);
  cartOpen = signal(false);

  navLinks = [
    { key: 'home', path: '/' },
    { key: 'catalog', path: '/catalog' },
    { key: 'brands', path: '/brands' },
    { key: 'about', path: '/about' },
    { key: 'contact', path: '/contact' },
  ];

  ngOnInit() {
    this.ps.getPartner().subscribe({
      next: (p: any) => {
        if (p?.name) this.partnerName.set(p.name);
        if (p?.logoImage) this.partnerLogo.set(p.logoImage);
      },
      error: () => {}
    });
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set(window.scrollY > 20); }

  search() {
    if (this.searchQuery().trim()) {
      this.router.navigate(['/catalog'], { queryParams: { q: this.searchQuery() } });
      this.mobileSearchOpen.set(false);
      this.searchQuery.set('');
    }
  }

  onSearchKey(e: KeyboardEvent) { if (e.key === 'Enter') this.search(); }
}
