import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductDto, getImageUrl } from '../../core/models/models';
import { LangService } from '../../core/services/lang.service';
import { inject, signal } from '@angular/core';
import { QuoteModalComponent } from '../quote-modal/quote-modal';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterLink, QuoteModalComponent],
  templateUrl: './product-card.html',
})
export class ProductCardComponent {
  @Input() product!: ProductDto;
  lang = inject(LangService);
  quoteOpen = signal(false);

  get mainImage(): string {
    if (!this.product?.images?.length) return '/assets/no-image.png';
    const main = this.product.images.find(i => i.id === this.product.mainImageId);
    return getImageUrl(main || this.product.images[0], 'medium');
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
