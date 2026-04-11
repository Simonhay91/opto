import { Component, inject, signal, OnInit, Input, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ProductService } from '../../core/services/product.service';
import { BrandService } from '../../core/services/brand.service';
import { LangService } from '../../core/services/lang.service';
import { SeoService } from '../../core/services/seo.service';
import { CartService } from '../../core/services/cart.service';
import { TrackingService } from '../../core/services/tracking.service';
import { ProductCardComponent } from '../../shared/product-card/product-card';
import { QuoteModalComponent } from '../../shared/quote-modal/quote-modal';
import { ProductDto, BrandDto, getImageUrl, getFileUrl } from '../../core/models/models';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterLink, ProductCardComponent, QuoteModalComponent],
  templateUrl: './product-detail.html',
})
export class ProductDetailComponent implements OnInit {
  @Input() slug!: string;

  private ps = inject(ProductService);
  private bs = inject(BrandService);
  private seo = inject(SeoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private tracking = inject(TrackingService);
  lang = inject(LangService);
  cart = inject(CartService);

  product = signal<any | null>(null);
  brands = signal<BrandDto[]>([]);
  loading = signal(true);
  error = signal(false);
  activeImageIdx = signal(0);
  activeTab = signal<'description' | 'specs' | 'attributes'>('description');
  relatedProducts = signal<ProductDto[]>([]);
  quoteOpen = signal(false);
  addedToCart = signal(false);

  ngOnInit() {
    this.bs.getAll().subscribe({ next: (d) => this.brands.set(d || []), error: () => {} });
    // Extract slug from full URL — supports both %2F-encoded and real / in slug
    const extractSlug = (): string | null => {
      const url = this.router.url;
      const match = url.match(/^\/product\/(.*?)(\?|$)/);
      return match ? decodeURIComponent(match[1]) : null;
    };

    const load = () => {
      const slug = extractSlug();
      if (slug) {
        this.activeImageIdx.set(0);
        this.activeTab.set('description');
        this.loadProduct(slug);
      }
    };

    // Initial load
    load();

    // Handle SPA navigation to another product
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => load());
  }

  loadProduct(slug: string) {
    this.loading.set(true);
    this.error.set(false);
    
    // Scroll to top on navigation (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    this.ps.getProduct(slug).subscribe({
      next: (resp: any) => {
        // API returns { product: {...} }, extract the product object
        const p = resp?.product || resp;
        // If loaded via legacy numeric ID URL, redirect to canonical slug URL
        if (p?.slug && /^\d+$/.test(slug) && p.slug !== slug) {
          this.router.navigate(['/product', ...p.slug.split('/')], { replaceUrl: true });
          return;
        }
        this.product.set(p);
        this.loading.set(false);
        if (p) {
          this.seo.setProductSchema(p);
          this.loadRelated(p);
          this.tracking.trackProductView(p);
        }
      },
      error: () => { this.loading.set(false); this.error.set(true); }
    });
  }

  loadRelated(product: any) {
    const categoryId = product.category_id || product.categoryId;
    if (!categoryId) return;
    
    this.ps.explore({ categoryId, limit: 4, page: 1, sortBy: 'newest' }).subscribe({
      next: (r: any) => {
        const items = r?.items || r?.products || (Array.isArray(r) ? r : []);
        this.relatedProducts.set(items.filter((p: any) => p.slug !== product.slug).slice(0, 4));
      },
      error: () => {}
    });
  }

  get images() {
    return this.product()?.images || [];
  }

  get activeImage(): string {
    const imgs = this.images;
    if (!imgs.length) return '/assets/no-image.png';
    return getImageUrl(imgs[this.activeImageIdx()], 'large');
  }

  getThumbUrl(img: any): string {
    return getImageUrl(img, 'thumb');
  }

  getDatasheetUrl(ds: any): string {
    return getFileUrl(ds?.path);
  }

  get quickSpecs(): { name: string; value: string }[] {
    const p = this.product();
    if (!p?.attributeValues?.length) return [];
    
    return p.attributeValues
      .filter((av: any) => av.textValue && av.attribute?.name)
      .slice(0, 6)
      .map((av: any) => ({
        name: av.attribute.name,
        value: av.textValue
      }));
  }

  get mainAttrs() {
    return this.product()?.attributes?.slice(0, 20) || [];
  }

  get isInCart(): boolean {
    return this.cart.isInCart(this.product()?.id);
  }

  getBrandName(): string | null {
    const p = this.product();
    if (!p) return null;
    const brandId = p.brand_id ?? p.brandId ?? p.brand?.id;
    if (!brandId) return null;
    return this.brands().find((b: any) => b.id === brandId)?.name || null;
  }

  getBrandId(): number | null {
    const p = this.product();
    if (!p) return null;
    return p.brand_id ?? p.brandId ?? p.brand?.id ?? null;
  }

  addToCart() {
    const p = this.product();
    if (p) {
      this.cart.addItem(p, 1);
      this.addedToCart.set(true);
      setTimeout(() => this.addedToCart.set(false), 1500);
    }
  }
}
