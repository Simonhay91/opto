import { Component, inject, signal, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { LangService } from '../../core/services/lang.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCardComponent } from '../../shared/product-card/product-card';
import { QuoteModalComponent } from '../../shared/quote-modal/quote-modal';
import { ProductDto } from '../../core/models/models';

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
  lang = inject(LangService);

  product = signal<ProductDto | null>(null);
  loading = signal(true);
  error = signal(false);
  activeImageIdx = signal(0);
  activeTab = signal<'specs' | 'description'>('specs');
  relatedProducts = signal<ProductDto[]>([]);
  quoteOpen = signal(false);

  ngOnInit() {
    const s = this.slug || this.route.snapshot.paramMap.get('slug') || '';
    if (s) this.loadProduct(s);
  }

  loadProduct(slug: string) {
    this.loading.set(true);
    this.ps.getProduct(slug).subscribe({
      next: (p: any) => {
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

  loadRelated(product: ProductDto) {
    this.ps.explore({ categoryId: product.categoryId, limit: 4, page: 1 }).subscribe({
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
    return imgs[this.activeImageIdx()]?.url || '/assets/no-image.png';
  }

  get inStock(): boolean {
    return (this.product()?.stockAmount ?? 0) > 0;
  }

  get mainAttrs() {
    return this.product()?.attributes?.slice(0, 20) || [];
  }
}
