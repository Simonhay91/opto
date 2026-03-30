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
    phoneCode: '+374',
    phoneNumber: '',
    quantity: '',
    message: '',
  };

  countryCodes = [
    { code: '+374', flag: '🇦🇲', name: 'Armenia' },
    { code: '+7',   flag: '🇷🇺', name: 'Russia' },
    { code: '+1',   flag: '🇺🇸', name: 'USA/Canada' },
    { code: '+44',  flag: '🇬🇧', name: 'UK' },
    { code: '+49',  flag: '🇩🇪', name: 'Germany' },
    { code: '+33',  flag: '🇫🇷', name: 'France' },
    { code: '+39',  flag: '🇮🇹', name: 'Italy' },
    { code: '+34',  flag: '🇪🇸', name: 'Spain' },
    { code: '+31',  flag: '🇳🇱', name: 'Netherlands' },
    { code: '+48',  flag: '🇵🇱', name: 'Poland' },
    { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
    { code: '+994', flag: '🇦🇿', name: 'Azerbaijan' },
    { code: '+995', flag: '🇬🇪', name: 'Georgia' },
    { code: '+998', flag: '🇺🇿', name: 'Uzbekistan' },
    { code: '+86',  flag: '🇨🇳', name: 'China' },
    { code: '+81',  flag: '🇯🇵', name: 'Japan' },
    { code: '+82',  flag: '🇰🇷', name: 'South Korea' },
    { code: '+91',  flag: '🇮🇳', name: 'India' },
    { code: '+971', flag: '🇦🇪', name: 'UAE' },
    { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
    { code: '+90',  flag: '🇹🇷', name: 'Turkey' },
    { code: '+972', flag: '🇮🇱', name: 'Israel' },
    { code: '+61',  flag: '🇦🇺', name: 'Australia' },
    { code: '+55',  flag: '🇧🇷', name: 'Brazil' },
    { code: '+52',  flag: '🇲🇽', name: 'Mexico' },
  ];

  submit(ngForm: NgForm) {
    if (ngForm.invalid) {
      ngForm.form.markAllAsTouched();
      return;
    }
    this.state.set('loading');

    const fullPhone = this.form.phoneNumber
      ? `${this.form.phoneCode} ${this.form.phoneNumber}`
      : '';

    const ctxParts: string[] = [];
    if (this.form.name) ctxParts.push(`Name: ${this.form.name}`);
    if (this.form.companyName) ctxParts.push(`Company: ${this.form.companyName}`);
    if (fullPhone) ctxParts.push(`Phone: ${fullPhone}`);
    if (this.form.quantity) ctxParts.push(`Quantity: ${this.form.quantity}`);
    if (this.form.message) ctxParts.push(`Message: ${this.form.message}`);

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
