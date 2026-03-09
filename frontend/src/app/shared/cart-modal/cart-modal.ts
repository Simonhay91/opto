import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart.service';
import { LangService } from '../../core/services/lang.service';
import { ApiService } from '../../core/services/api.service';
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
  private api = inject(ApiService);
  
  quoteMode = signal(false);
  submitting = signal(false);
  submitted = signal(false);
  error = signal('');
  
  // Quote form - only email is required
  form = {
    email: ''
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
    
    // Format products according to API spec: { productId, stockAmount }
    const products = this.cart.items().map(item => ({
      productId: item.product.id,
      stockAmount: item.quantity
    }));
    
    const payload = {
      email: this.form.email,
      products
    };
    
    // Use new global-preorder endpoint via partner service
    this.partnerService.submitQuote(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
        this.cart.clearCart();
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set('Failed to submit. Please try again.');
        console.error('Quote submit error:', err);
      }
    });
  }
}
