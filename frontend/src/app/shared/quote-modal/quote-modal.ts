import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { PartnerService } from '../../core/services/partner.service';
import { LangService } from '../../core/services/lang.service';

export interface QuoteProduct {
  id?: number | string;
  name: string;
  model?: string;
  slug?: string;
  crmCode?: string;
}

@Component({
  selector: 'app-quote-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './quote-modal.html',
})
export class QuoteModalComponent {
  @Input() product: QuoteProduct | null = null;
  @Output() closed = new EventEmitter<void>();

  private partnerService = inject(PartnerService);
  lang = inject(LangService);

  state = signal<'form' | 'loading' | 'success' | 'error'>('form');

  form = {
    name: '',
    email: '',
    companyName: '',
    phone: '',
    quantity: '',
    message: '',
  };

  submit(ngForm: NgForm) {
    if (ngForm.invalid) return;
    this.state.set('loading');

    // Build context from optional fields
    const ctxParts: string[] = [];
    if (this.form.name) ctxParts.push(`Name: ${this.form.name}`);
    if (this.form.companyName) ctxParts.push(`Company: ${this.form.companyName}`);
    if (this.form.phone) ctxParts.push(`Phone: ${this.form.phone}`);
    if (this.form.quantity) ctxParts.push(`Quantity: ${this.form.quantity}`);
    if (this.form.message) ctxParts.push(`Message: ${this.form.message}`);

    // API expects { productId, stockAmount }
    const products = this.product
      ? [{ productId: this.product.id, stockAmount: 1 }]
      : [];

    const payload = {
      email: this.form.email,
      products,
      context: ctxParts.join('\n'),
    };

    this.partnerService.submitQuote(payload).subscribe({
      next: () => this.state.set('success'),
      error: () => this.state.set('error'),
    });
  }

  close() { this.closed.emit(); }
  retry() { this.state.set('form'); }
}
