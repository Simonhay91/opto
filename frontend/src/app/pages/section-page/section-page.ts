import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { SeoService } from '../../core/services/seo.service';
import { LangService } from '../../core/services/lang.service';
import { ProductCardComponent } from '../../shared/product-card/product-card';
import { ProductDto } from '../../core/models/models';

@Component({
  selector: 'app-section-page',
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './section-page.html',
})
export class SectionPageComponent implements OnInit {
  private ps = inject(ProductService);
  private seo = inject(SeoService);
  private route = inject(ActivatedRoute);
  lang = inject(LangService);

  products = signal<ProductDto[]>([]);
  loading = signal(true);

  sectionId = '';
  title = '';
  zhTitle = '';

  readonly pageSize = 24;
  currentPage = signal(1);

  visibleProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.products().slice(start, start + this.pageSize);
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.products().length / this.pageSize))
  );

  pages = computed(() => {
    const total = this.totalPages();
    if (total <= 1) return [];
    const cur = this.currentPage();
    const all = Array.from({ length: total }, (_, i) => i + 1);
    if (total <= 7) return all;
    const set = new Set([1, total, cur - 1, cur, cur + 1].filter(p => p >= 1 && p <= total));
    return Array.from(set).sort((a, b) => a - b);
  });

  ngOnInit() {
    const data = this.route.snapshot.data;
    this.sectionId = data['sectionId'];
    this.title = data['title'];
    this.zhTitle = data['zhTitle'] || '';
    this.seo.setPage(this.title, `Browse ${this.title} products from Optowire.`);
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.ps.getSectionProducts(this.sectionId).subscribe({
      next: (r: any) => {
        const items: ProductDto[] = Array.isArray(r) ? r : (r?.items || r?.products || []);
        this.products.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.products.set([]);
      }
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
