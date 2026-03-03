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
  
  // Quote form
  form = {
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
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
    this.cart.updateQuantity(item.product.id, item.quantity + delta);
  }
  
  removeItem(item: CartItem) {
    this.cart.removeItem(item.product.id);
  }
  
  startQuote() {
    this.quoteMode.set(true);
    this.error.set('');
  }
  
  backToCart() {
    this.quoteMode.set(false);
  }
  
  submitQuote() {
    if (!this.form.name || !this.form.email) {
      this.error.set('Please fill in required fields');
      return;
    }
    
    this.submitting.set(true);
    this.error.set('');
    
    const products = this.cart.items().map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      model: item.product.model,
      quantity: item.quantity
    }));
    
    const payload = {
      ...this.form,
      products,
      totalItems: this.cart.totalItems,
      source: 'cart_quote'
    };
    
    this.api.post('/proxy/web/project-inquiry', payload).subscribe({
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
