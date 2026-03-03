import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductDto } from '../../core/models/models';
import { LangService } from '../../core/services/lang.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.html',
})
export class ProductCardComponent {
  @Input() product!: ProductDto;
  lang = inject(LangService);

  get mainImage(): string {
    if (!this.product?.images?.length) return '/assets/no-image.png';
    const main = this.product.images.find(i => i.id === this.product.mainImageId);
    return (main || this.product.images[0])?.url || '/assets/no-image.png';
  }

  get price(): string {
    const pi = this.product?.pricingInfo;
    if (!pi) return '';
    const base = pi.tiers?.[0]?.price ?? pi.basePrice;
    if (!base) return '';
    return `${pi.currency || 'USD'} ${base.toLocaleString()}`;
  }

  get inStock(): boolean {
    return (this.product?.stockAmount ?? 0) > 0;
  }
}
