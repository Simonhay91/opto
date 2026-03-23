import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  trackProductView(product: any): void {
    if (!isPlatformBrowser(this.platformId) || !product?.id) return;
    this.http.post('/api/track/product-view', {
      product_id: product.id,
      product_name: product.name || '',
      slug: product.slug || '',
    }).subscribe({ error: () => {} });
  }

  trackSearch(query: string, resultsFound: number): void {
    if (!isPlatformBrowser(this.platformId) || !query?.trim()) return;
    this.http.post('/api/track/search', {
      query: query.trim(),
      results_found: resultsFound,
    }).subscribe({ error: () => {} });
  }
}
