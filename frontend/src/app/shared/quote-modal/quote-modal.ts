import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { LangService } from '../../core/services/lang.service';

export interface QuoteProduct {
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

  private api = inject(ApiService);
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

    const payload = {
      type: 'product',
      name: this.form.name,
      email: this.form.email,
      companyName: this.form.companyName || undefined,
      phone: this.form.phone || undefined,
      quantity: this.form.quantity ? Number(this.form.quantity) : undefined,
      message: this.product
        ? `Product: ${this.product.name}${this.product.model ? ' / ' + this.product.model : ''}${this.product.crmCode ? ' #' + this.product.crmCode : ''}\n\n${this.form.message}`
        : this.form.message,
    };

    this.api.post('/proxy/web/project-inquiry', payload).subscribe({
      next: () => this.state.set('success'),
      error: () => this.state.set('error'),
    });
  }

  close() { this.closed.emit(); }

  retry() {
    this.state.set('form');
  }
}
