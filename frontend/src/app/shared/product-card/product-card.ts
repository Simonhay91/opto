import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductDto, getImageUrl } from '../../core/models/models';
import { LangService } from '../../core/services/lang.service';
import { CartService } from '../../core/services/cart.service';
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
  cart = inject(CartService);
  quoteOpen = signal(false);
  addedToCart = signal(false);

  get mainImage(): string {
    if (!this.product?.images?.length) return '/assets/no-image.png';
    const main = this.product.images.find(i => i.id === this.product.mainImageId);
    return getImageUrl(main || this.product.images[0], 'medium');
  }

  get isInCart(): boolean {
    return this.cart.isInCart(this.product?.id);
  }

  addToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.cart.addItem(this.product, 1);
    this.addedToCart.set(true);
    setTimeout(() => this.addedToCart.set(false), 1500);
  }
}
