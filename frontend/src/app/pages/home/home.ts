import { Component, inject, signal, OnInit, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { BrandService } from '../../core/services/brand.service';
import { SliderService } from '../../core/services/slider.service';
import { LangService } from '../../core/services/lang.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCardComponent } from '../../shared/product-card/product-card';
import { Slider, ProductDto, CategoryDto, BrandDto, getImageUrl } from '../../core/models/models';
import { SUPPORTED_CATEGORIES } from '../../core/config/categories.config';

interface ProductSection {
  id: string;
  name: string;
  products: ProductDto[];
  loading: boolean;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  private ps = inject(ProductService);
  private cs = inject(CategoryService);
  private bs = inject(BrandService);
  private sliderService = inject(SliderService);
  private seo = inject(SeoService);
  private platformId = inject(PLATFORM_ID);
  lang = inject(LangService);

  sliders = signal<Slider[]>([]);
  currentSlide = signal(0);
  slidersLoading = signal(true);
  categories = signal<CategoryDto[]>([]);
  brands = signal<BrandDto[]>([]);
  sections = signal<ProductSection[]>([]);
  promoUnits = signal<any[]>([]);
  getImageUrl = getImageUrl;
  private slideInterval: any;

  // Supported categories with icons
  supportedCategories = SUPPORTED_CATEGORIES;

  ngOnInit() {
    this.seo.setOrganizationSchema();
    this.seo.setPage('Fiber Optic & Network Equipment', 'Leading fiber optic manufacturer in Qingdao, China. Shop telecom cables, network equipment, IoT & security solutions.');
    this.loadSliders();
    this.loadCategories();
    this.loadBrands();
    this.loadSections();
    this.loadPromoUnits();
  }

  loadSliders() {
    this.slidersLoading.set(true);
    this.sliderService.getAll().subscribe({
      next: (data: Slider[]) => {
        // Sort by priority ascending (1 → 2 → 3)
        const sorted = [...data].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
        this.sliders.set(sorted);
        this.slidersLoading.set(false);
        if (isPlatformBrowser(this.platformId)) this.startAutoSlide();
      },
      error: () => {
        this.sliders.set([]);
        this.slidersLoading.set(false);
      }
    });
  }

  getSliderImage(slider: Slider, size: 'mobile' | 'desktop' = 'desktop'): string {
    if (!slider.image) return '/assets/no-image.png';
    
    if (size === 'mobile' && slider.image.path636px) {
      return getImageUrl(slider.image, 'medium');
    }
    return getImageUrl(slider.image, 'large');
  }

  loadCategories() {
    // Use only supported categories
    this.categories.set(SUPPORTED_CATEGORIES.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon
    } as any)));
  }

  loadBrands() {
    this.bs.getAll().subscribe({
      next: (data) => this.brands.set(data || []),
      error: () => {}
    });
  }

  loadSections() {
    // Use explore with sortBy: newest for product sections
    const sections: ProductSection[] = [
      { id: 'newest', name: this.lang.t('newArrivals'), products: [], loading: true },
      { id: 'popular', name: this.lang.t('topProducts'), products: [], loading: true },
    ];
    this.sections.set(sections);
    
    // Load newest products
    this.ps.explore({ page: 1, limit: 8, sortBy: 'newest' }).subscribe({
      next: (r: any) => {
        const items = r?.items || r?.products || (Array.isArray(r) ? r : []);
        this.sections.update(s => { 
          s[0].products = Array.isArray(items) ? items.slice(0, 8) : []; 
          s[0].loading = false; 
          return [...s]; 
        });
      },
      error: () => { this.sections.update(s => { s[0].loading = false; return [...s]; }); }
    });
    
    // Load popular products (use different page for variety)
    this.ps.explore({ page: 2, limit: 8, sortBy: 'newest' }).subscribe({
      next: (r: any) => {
        const items = r?.items || r?.products || (Array.isArray(r) ? r : []);
        this.sections.update(s => { 
          if (s[1]) { 
            s[1].products = Array.isArray(items) ? items.slice(0, 8) : []; 
            s[1].loading = false; 
          } 
          return [...s]; 
        });
      },
      error: () => { this.sections.update(s => { if (s[1]) s[1].loading = false; return [...s]; }); }
    });
  }

  loadFallbackSections() {
    const sections: ProductSection[] = [
      { id: 'top', name: this.lang.t('topProducts'), products: [], loading: true },
      { id: 'new', name: this.lang.t('newArrivals'), products: [], loading: true },
    ];
    this.sections.set(sections);
    this.ps.explore({ page: 1, limit: 8, sortBy: 'popular' }).subscribe({
      next: (r: any) => {
        const items = r?.items || r?.products || (Array.isArray(r) ? r : []);
        this.sections.update(s => { s[0].products = Array.isArray(items) ? items.slice(0, 8) : []; s[0].loading = false; return [...s]; });
      },
      error: () => { this.sections.update(s => { s[0].loading = false; return [...s]; }); }
    });
    this.ps.explore({ page: 1, limit: 8, sortBy: 'newest' }).subscribe({
      next: (r: any) => {
        const items = r?.items || r?.products || (Array.isArray(r) ? r : []);
        this.sections.update(s => { if (s[1]) { s[1].products = Array.isArray(items) ? items.slice(0, 8) : []; s[1].loading = false; } return [...s]; });
      },
      error: () => { this.sections.update(s => { if (s[1]) s[1].loading = false; return [...s]; }); }
    });
  }

  loadSectionProducts(section: ProductSection) {
    this.ps.getSectionProducts(section.id, { page: 1, limit: 8 }).subscribe({
      next: (r: any) => {
        const items = r?.items || r?.products || (Array.isArray(r) ? r : []);
        this.sections.update(secs => {
          const idx = secs.findIndex(s => s.id === section.id);
          if (idx >= 0) { secs[idx].products = Array.isArray(items) ? items.slice(0, 8) : []; secs[idx].loading = false; }
          return [...secs];
        });
      },
      error: () => {
        this.sections.update(secs => {
          const idx = secs.findIndex(s => s.id === section.id);
          if (idx >= 0) secs[idx].loading = false;
          return [...secs];
        });
      }
    });
  }

  loadPromoUnits() {
    this.ps.getPromotionalUnits().subscribe({
      next: (data: any) => this.promoUnits.set(Array.isArray(data) ? data.slice(0, 3) : []),
      error: () => {}
    });
  }

  startAutoSlide() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  prevSlide() {
    this.currentSlide.update(i => (i - 1 + this.sliders().length) % this.sliders().length);
  }

  nextSlide() {
    this.currentSlide.update(i => (i + 1) % this.sliders().length);
  }

  goToSlide(i: number) { this.currentSlide.set(i); }

  ngOnDestroy() { if (this.slideInterval) clearInterval(this.slideInterval); }
}
