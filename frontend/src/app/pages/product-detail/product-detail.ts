import { Component, inject, signal, OnInit, Input, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { LangService } from '../../core/services/lang.service';
import { SeoService } from '../../core/services/seo.service';
import { CartService } from '../../core/services/cart.service';
import { ProductCardComponent } from '../../shared/product-card/product-card';
import { QuoteModalComponent } from '../../shared/quote-modal/quote-modal';
import { ProductDto, getImageUrl, getFileUrl } from '../../core/models/models';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterLink, ProductCardComponent, QuoteModalComponent],
  templateUrl: './product-detail.html',
})
export class ProductDetailComponent implements OnInit {
  @Input() slug!: string;

  private ps = inject(ProductService);
  private seo = inject(SeoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  lang = inject(LangService);
  cart = inject(CartService);

  product = signal<any | null>(null);
  loading = signal(true);
  error = signal(false);
  activeImageIdx = signal(0);
  activeTab = signal<'description' | 'specs' | 'attributes'>('description');
  relatedProducts = signal<ProductDto[]>([]);
  quoteOpen = signal(false);
  addedToCart = signal(false);

  ngOnInit() {
    // Get slug from URL - handle both /product/:slug and /product/**
    let s = this.slug;
    if (!s) {
      const url = this.router.url;
      if (url.startsWith('/product/')) {
        s = url.substring('/product/'.length);
      } else {
        s = this.route.snapshot.paramMap.get('slug') || '';
      }
    }
    if (s) this.loadProduct(s);
  }

  loadProduct(slug: string) {
    this.loading.set(true);
    this.ps.getProduct(slug).subscribe({
      next: (resp: any) => {
        // API returns { product: {...} }, extract the product object
        const p = resp?.product || resp;
        this.product.set(p);
        this.loading.set(false);
        if (p) {
          this.seo.setProductSchema(p);
          this.loadRelated(p);
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
}
