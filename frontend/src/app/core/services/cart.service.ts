import { Injectable, signal } from '@angular/core';
import { ProductDto } from '../models/models';

export interface CartItem {
  product: ProductDto;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private storageKey = 'optowire_cart';
  
  items = signal<CartItem[]>([]);
  
  constructor() {
    this.loadFromStorage();
  }
  
  private loadFromStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const data = localStorage.getItem(this.storageKey);
        if (data) {
          this.items.set(JSON.parse(data));
        }
      } catch (e) {
        console.error('Error loading cart from storage:', e);
      }
    }
  }
  
  private saveToStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items()));
      } catch (e) {
        console.error('Error saving cart to storage:', e);
      }
    }
  }
  
  addItem(product: ProductDto, quantity: number = 1) {
    const current = this.items();
    const existingIndex = current.findIndex(item => item.product.id === product.id);
    
    if (existingIndex >= 0) {
      // Update quantity
      const updated = [...current];
      updated[existingIndex].quantity += quantity;
      this.items.set(updated);
    } else {
      // Add new item
      this.items.set([...current, { product, quantity }]);
    }
    this.saveToStorage();
  }
  
  removeItem(productId: number | string) {
    const current = this.items();
    this.items.set(current.filter(item => item.product.id !== productId));
    this.saveToStorage();
  }
  
  updateQuantity(productId: number | string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    
    const current = this.items();
    const updated = current.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    );
    this.items.set(updated);
    this.saveToStorage();
  }
  
  clearCart() {
    this.items.set([]);
    this.saveToStorage();
  }
  
  get itemCount(): number {
    return this.items().reduce((sum, item) => sum + item.quantity, 0);
  }
  
  get totalItems(): number {
    return this.items().length;
  }
  
  isInCart(productId: number | string): boolean {
    return this.items().some(item => item.product.id === productId);
  }
  
  getCartProducts(): ProductDto[] {
    return this.items().map(item => item.product);
  }
}
