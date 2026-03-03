import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { LangService } from '../../core/services/lang.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCardComponent } from '../../shared/product-card/product-card';
import { SliderDto, ProductDto, CategoryDto } from '../../core/models/models';

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
export class HomeComponent implements OnInit {
  private ps = inject(ProductService);
  private cs = inject(CategoryService);
  private seo = inject(SeoService);
  private platformId = inject(PLATFORM_ID);
  lang = inject(LangService);

  sliders = signal<SliderDto[]>([]);
  currentSlide = signal(0);
  slidersLoading = signal(true);
  categories = signal<CategoryDto[]>([]);
  sections = signal<ProductSection[]>([]);
  promoUnits = signal<any[]>([]);
  private slideInterval: any;

  // Fallback sliders when API not available
  fallbackSliders: SliderDto[] = [
    {
      id: '1',
      title: 'High-Performance Fiber Optic Cables',
      subtitle: 'Connecting the World with Precision',
      imageUrl: 'https://images.unsplash.com/photo-1642999754574-e8c4709f4169?w=1600&q=80',
      buttonText: 'Explore Products',
      link: '/catalog',
    },
    {
      id: '2',
      title: 'Network Equipment Solutions',
      subtitle: 'Enterprise-Grade Connectivity',
      imageUrl: 'https://images.unsplash.com/photo-1663932210347-164a05ed0ccd?w=1600&q=80',
      buttonText: 'View Catalog',
      link: '/catalog',
    },
    {
      id: '3',
      title: 'IoT & Security Systems',
      subtitle: 'Smart Solutions for Modern Infrastructure',
      imageUrl: 'https://images.unsplash.com/photo-1469289759076-d1484757abc3?w=1600&q=80',
      buttonText: 'Discover More',
      link: '/catalog',
    },
  ];

  fallbackCategories = [
    { id: '1', name: 'Telecommunication', icon: 'T', desc: '电信 · Fiber, ODN, Data Center' },
    { id: '2', name: 'Network Equipment', icon: 'N', desc: '网络设备 · Switches, Transceivers' },
    { id: '3', name: 'Security Systems', icon: 'S', desc: '安防 · CCTV, Access Control' },
    { id: '4', name: 'IoT Solutions', icon: 'I', desc: '物联网 · Smart Devices, Sensors' },
  ];

  ngOnInit() {
    this.seo.setOrganizationSchema();
    this.seo.setPage('Fiber Optic & Network Equipment', 'Leading fiber optic manufacturer in Qingdao, China. Shop telecom cables, network equipment, IoT & security solutions.');
    this.loadSliders();
    this.loadCategories();
    this.loadSections();
    this.loadPromoUnits();
  }

  loadSliders() {
    this.slidersLoading.set(true);
    this.ps.getSliders().subscribe({
      next: (data: any) => {
        const arr = Array.isArray(data) ? data : data?.items || [];
        this.sliders.set(arr.length ? arr : this.fallbackSliders);
        this.slidersLoading.set(false);
        if (isPlatformBrowser(this.platformId)) this.startAutoSlide();
      },
      error: () => {
        this.sliders.set(this.fallbackSliders);
        this.slidersLoading.set(false);
        if (isPlatformBrowser(this.platformId)) this.startAutoSlide();
      }
    });
  }

  loadCategories() {
    this.cs.getAll().subscribe({
      next: (data: any) => {
        const arr = Array.isArray(data) ? data : data?.items || [];
        this.categories.set(arr.slice(0, 8));
      },
      error: () => this.categories.set(this.fallbackCategories as any)
    });
  }

  loadSections() {
    this.ps.getSections().subscribe({
      next: (secs: any) => {
        const arr = Array.isArray(secs) ? secs : secs?.items || [];
        const sections: ProductSection[] = arr.slice(0, 3).map((s: any) => ({
          id: s.id, name: s.name, products: [], loading: true
        }));
        // Fallback section names if API gives unnamed sections
        const fallbackNames = [this.lang.t('topProducts'), this.lang.t('newArrivals'), this.lang.t('featuredProducts')];
        sections.forEach((s, i) => { if (!s.name) s.name = fallbackNames[i]; });
        this.sections.set(sections);
        sections.forEach(s => this.loadSectionProducts(s));
      },
      error: () => {
        // Try direct product explore for featured sections
        this.loadFallbackSections();
      }
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
        const items = r?.items || r || [];
        this.sections.update(s => { s[0].products = Array.isArray(items) ? items.slice(0, 8) : []; s[0].loading = false; return [...s]; });
      },
      error: () => { this.sections.update(s => { s[0].loading = false; return [...s]; }); }
    });
    this.ps.explore({ page: 1, limit: 8, sortBy: 'newest' }).subscribe({
      next: (r: any) => {
        const items = r?.items || r || [];
        this.sections.update(s => { if (s[1]) { s[1].products = Array.isArray(items) ? items.slice(0, 8) : []; s[1].loading = false; } return [...s]; });
      },
      error: () => { this.sections.update(s => { if (s[1]) s[1].loading = false; return [...s]; }); }
    });
  }

  loadSectionProducts(section: ProductSection) {
    this.ps.getSectionProducts(section.id, { page: 1, limit: 8 }).subscribe({
      next: (r: any) => {
        const items = r?.items || r || [];
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

  getSliderImage(s: SliderDto): string {
    return s.imageUrl || s.image || 'https://images.unsplash.com/photo-1642999754574-e8c4709f4169?w=1600&q=80';
  }

  ngOnDestroy() { if (this.slideInterval) clearInterval(this.slideInterval); }
}
