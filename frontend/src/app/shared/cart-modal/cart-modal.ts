import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart.service';
import { LangService } from '../../core/services/lang.service';
import { PartnerService } from '../../core/services/partner.service';
import { getImageUrl } from '../../core/models/models';

@Component({
  selector: 'app-cart-modal',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart-modal.html',
})
export class CartModalComponent {
  @Output() closed = new EventEmitter<void>();
  
  cart = inject(CartService);
  lang = inject(LangService);
  private partnerService = inject(PartnerService);
  
  quoteMode = signal(false);
  submitting = signal(false);
  submitted = signal(false);
  error = signal('');
  
  // Quote form - only email is required, rest optional
  form = {
    email: '',
    name: '',
    companyName: '',
    phone: '',
    message: '',
  };
  
  close() {
    this.closed.emit();
  }
  
  getProductImage(product: any): string {
    if (!product?.images?.length) return '/assets/no-image.png';
    const main = product.images.find((i: any) => i.id === product.mainImageId);
    return getImageUrl(main || product.images[0], 'thumb');
  }
  
  updateQty(item: CartItem, delta: number) {
    if (item.product.id) {
      this.cart.updateQuantity(item.product.id, item.quantity + delta);
    }
  }
  
  removeItem(item: CartItem) {
    if (item.product.id) {
      this.cart.removeItem(item.product.id);
    }
  }
  
  startQuote() {
    this.quoteMode.set(true);
    this.error.set('');
  }
  
  backToCart() {
    this.quoteMode.set(false);
  }
  
  submitQuote() {
    if (!this.form.email) {
      this.error.set('Email is required');
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    // Build products array as Partial<Stock>[]
    const products = this.cart.items().map(item => ({
      id: item.product.id,
      name: item.product.name,
      model: item.product.model,
      slug: item.product.slug,
      stockAmount: item.quantity,
    }));

    // Build context from optional fields
    const ctxParts: string[] = [];
    if (this.form.name) ctxParts.push(`Name: ${this.form.name}`);
    if (this.form.companyName) ctxParts.push(`Company: ${this.form.companyName}`);
    if (this.form.phone) ctxParts.push(`Phone: ${this.form.phone}`);
    if (this.form.message) ctxParts.push(`Message: ${this.form.message}`);

    const payload = {
      email: this.form.email,
      products,
      context: ctxParts.join('\n'),
    };

    this.partnerService.submitQuote(payload).subscribe(
      () => {
        this.submitting.set(false);
        this.submitted.set(true);
        this.cart.clearCart();
      },
      () => {
        this.submitting.set(false);
        this.error.set('Failed to submit. Please try again.');
      }
    );
  }
}
