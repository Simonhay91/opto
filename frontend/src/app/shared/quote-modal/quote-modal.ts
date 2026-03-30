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
    { code: '+7',    flag: '🇷🇺', name: 'Russia' },
    { code: '+1',    flag: '🇺🇸', name: 'USA / Canada' },
    { code: '+44',   flag: '🇬🇧', name: 'United Kingdom' },
    { code: '+374',  flag: '🇦🇲', name: 'Armenia' },
    { code: '+994',  flag: '🇦🇿', name: 'Azerbaijan' },
    { code: '+995',  flag: '🇬🇪', name: 'Georgia' },
    { code: '+380',  flag: '🇺🇦', name: 'Ukraine' },
    { code: '+375',  flag: '🇧🇾', name: 'Belarus' },
    { code: '+998',  flag: '🇺🇿', name: 'Uzbekistan' },
    { code: '+996',  flag: '🇰🇬', name: 'Kyrgyzstan' },
    { code: '+992',  flag: '🇹🇯', name: 'Tajikistan' },
    { code: '+993',  flag: '🇹🇲', name: 'Turkmenistan' },
    { code: '+7776', flag: '🇰🇿', name: 'Kazakhstan' },
    { code: '+49',   flag: '🇩🇪', name: 'Germany' },
    { code: '+33',   flag: '🇫🇷', name: 'France' },
    { code: '+39',   flag: '🇮🇹', name: 'Italy' },
    { code: '+34',   flag: '🇪🇸', name: 'Spain' },
    { code: '+31',   flag: '🇳🇱', name: 'Netherlands' },
    { code: '+32',   flag: '🇧🇪', name: 'Belgium' },
    { code: '+41',   flag: '🇨🇭', name: 'Switzerland' },
    { code: '+43',   flag: '🇦🇹', name: 'Austria' },
    { code: '+48',   flag: '🇵🇱', name: 'Poland' },
    { code: '+420',  flag: '🇨🇿', name: 'Czech Republic' },
    { code: '+421',  flag: '🇸🇰', name: 'Slovakia' },
    { code: '+36',   flag: '🇭🇺', name: 'Hungary' },
    { code: '+40',   flag: '🇷🇴', name: 'Romania' },
    { code: '+359',  flag: '🇧🇬', name: 'Bulgaria' },
    { code: '+385',  flag: '🇭🇷', name: 'Croatia' },
    { code: '+381',  flag: '🇷🇸', name: 'Serbia' },
    { code: '+30',   flag: '🇬🇷', name: 'Greece' },
    { code: '+351',  flag: '🇵🇹', name: 'Portugal' },
    { code: '+46',   flag: '🇸🇪', name: 'Sweden' },
    { code: '+47',   flag: '🇳🇴', name: 'Norway' },
    { code: '+45',   flag: '🇩🇰', name: 'Denmark' },
    { code: '+358',  flag: '🇫🇮', name: 'Finland' },
    { code: '+354',  flag: '🇮🇸', name: 'Iceland' },
    { code: '+353',  flag: '🇮🇪', name: 'Ireland' },
    { code: '+352',  flag: '🇱🇺', name: 'Luxembourg' },
    { code: '+356',  flag: '🇲🇹', name: 'Malta' },
    { code: '+357',  flag: '🇨🇾', name: 'Cyprus' },
    { code: '+370',  flag: '🇱🇹', name: 'Lithuania' },
    { code: '+371',  flag: '🇱🇻', name: 'Latvia' },
    { code: '+372',  flag: '🇪🇪', name: 'Estonia' },
    { code: '+373',  flag: '🇲🇩', name: 'Moldova' },
    { code: '+376',  flag: '🇦🇩', name: 'Andorra' },
    { code: '+377',  flag: '🇲🇨', name: 'Monaco' },
    { code: '+378',  flag: '🇸🇲', name: 'San Marino' },
    { code: '+382',  flag: '🇲🇪', name: 'Montenegro' },
    { code: '+383',  flag: '🇽🇰', name: 'Kosovo' },
    { code: '+387',  flag: '🇧🇦', name: 'Bosnia & Herzegovina' },
    { code: '+389',  flag: '🇲🇰', name: 'North Macedonia' },
    { code: '+355',  flag: '🇦🇱', name: 'Albania' },
    { code: '+386',  flag: '🇸🇮', name: 'Slovenia' },
    { code: '+90',   flag: '🇹🇷', name: 'Turkey' },
    { code: '+972',  flag: '🇮🇱', name: 'Israel' },
    { code: '+971',  flag: '🇦🇪', name: 'UAE' },
    { code: '+966',  flag: '🇸🇦', name: 'Saudi Arabia' },
    { code: '+974',  flag: '🇶🇦', name: 'Qatar' },
    { code: '+973',  flag: '🇧🇭', name: 'Bahrain' },
    { code: '+968',  flag: '🇴🇲', name: 'Oman' },
    { code: '+965',  flag: '🇰🇼', name: 'Kuwait' },
    { code: '+962',  flag: '🇯🇴', name: 'Jordan' },
    { code: '+961',  flag: '🇱🇧', name: 'Lebanon' },
    { code: '+963',  flag: '🇸🇾', name: 'Syria' },
    { code: '+964',  flag: '🇮🇶', name: 'Iraq' },
    { code: '+98',   flag: '🇮🇷', name: 'Iran' },
    { code: '+93',   flag: '🇦🇫', name: 'Afghanistan' },
    { code: '+92',   flag: '🇵🇰', name: 'Pakistan' },
    { code: '+91',   flag: '🇮🇳', name: 'India' },
    { code: '+94',   flag: '🇱🇰', name: 'Sri Lanka' },
    { code: '+880',  flag: '🇧🇩', name: 'Bangladesh' },
    { code: '+977',  flag: '🇳🇵', name: 'Nepal' },
    { code: '+975',  flag: '🇧🇹', name: 'Bhutan' },
    { code: '+960',  flag: '🇲🇻', name: 'Maldives' },
    { code: '+86',   flag: '🇨🇳', name: 'China' },
    { code: '+81',   flag: '🇯🇵', name: 'Japan' },
    { code: '+82',   flag: '🇰🇷', name: 'South Korea' },
    { code: '+850',  flag: '🇰🇵', name: 'North Korea' },
    { code: '+886',  flag: '🇹🇼', name: 'Taiwan' },
    { code: '+852',  flag: '🇭🇰', name: 'Hong Kong' },
    { code: '+853',  flag: '🇲🇴', name: 'Macao' },
    { code: '+976',  flag: '🇲🇳', name: 'Mongolia' },
    { code: '+65',   flag: '🇸🇬', name: 'Singapore' },
    { code: '+60',   flag: '🇲🇾', name: 'Malaysia' },
    { code: '+62',   flag: '🇮🇩', name: 'Indonesia' },
    { code: '+63',   flag: '🇵🇭', name: 'Philippines' },
    { code: '+66',   flag: '🇹🇭', name: 'Thailand' },
    { code: '+84',   flag: '🇻🇳', name: 'Vietnam' },
    { code: '+855',  flag: '🇰🇭', name: 'Cambodia' },
    { code: '+856',  flag: '🇱🇦', name: 'Laos' },
    { code: '+95',   flag: '🇲🇲', name: 'Myanmar' },
    { code: '+673',  flag: '🇧🇳', name: 'Brunei' },
    { code: '+670',  flag: '🇹🇱', name: 'Timor-Leste' },
    { code: '+61',   flag: '🇦🇺', name: 'Australia' },
    { code: '+64',   flag: '🇳🇿', name: 'New Zealand' },
    { code: '+675',  flag: '🇵🇬', name: 'Papua New Guinea' },
    { code: '+679',  flag: '🇫🇯', name: 'Fiji' },
    { code: '+685',  flag: '🇼🇸', name: 'Samoa' },
    { code: '+676',  flag: '🇹🇴', name: 'Tonga' },
    { code: '+677',  flag: '🇸🇧', name: 'Solomon Islands' },
    { code: '+678',  flag: '🇻🇺', name: 'Vanuatu' },
    { code: '+20',   flag: '🇪🇬', name: 'Egypt' },
    { code: '+212',  flag: '🇲🇦', name: 'Morocco' },
    { code: '+213',  flag: '🇩🇿', name: 'Algeria' },
    { code: '+216',  flag: '🇹🇳', name: 'Tunisia' },
    { code: '+218',  flag: '🇱🇾', name: 'Libya' },
    { code: '+249',  flag: '🇸🇩', name: 'Sudan' },
    { code: '+251',  flag: '🇪🇹', name: 'Ethiopia' },
    { code: '+254',  flag: '🇰🇪', name: 'Kenya' },
    { code: '+255',  flag: '🇹🇿', name: 'Tanzania' },
    { code: '+256',  flag: '🇺🇬', name: 'Uganda' },
    { code: '+234',  flag: '🇳🇬', name: 'Nigeria' },
    { code: '+233',  flag: '🇬🇭', name: 'Ghana' },
    { code: '+225',  flag: '🇨🇮', name: "Côte d'Ivoire" },
    { code: '+221',  flag: '🇸🇳', name: 'Senegal' },
    { code: '+237',  flag: '🇨🇲', name: 'Cameroon' },
    { code: '+27',   flag: '🇿🇦', name: 'South Africa' },
    { code: '+263',  flag: '🇿🇼', name: 'Zimbabwe' },
    { code: '+260',  flag: '🇿🇲', name: 'Zambia' },
    { code: '+258',  flag: '🇲🇿', name: 'Mozambique' },
    { code: '+267',  flag: '🇧🇼', name: 'Botswana' },
    { code: '+264',  flag: '🇳🇦', name: 'Namibia' },
    { code: '+261',  flag: '🇲🇬', name: 'Madagascar' },
    { code: '+55',   flag: '🇧🇷', name: 'Brazil' },
    { code: '+54',   flag: '🇦🇷', name: 'Argentina' },
    { code: '+57',   flag: '🇨🇴', name: 'Colombia' },
    { code: '+56',   flag: '🇨🇱', name: 'Chile' },
    { code: '+51',   flag: '🇵🇪', name: 'Peru' },
    { code: '+58',   flag: '🇻🇪', name: 'Venezuela' },
    { code: '+52',   flag: '🇲🇽', name: 'Mexico' },
    { code: '+502',  flag: '🇬🇹', name: 'Guatemala' },
    { code: '+503',  flag: '🇸🇻', name: 'El Salvador' },
    { code: '+504',  flag: '🇭🇳', name: 'Honduras' },
    { code: '+505',  flag: '🇳🇮', name: 'Nicaragua' },
    { code: '+506',  flag: '🇨🇷', name: 'Costa Rica' },
    { code: '+507',  flag: '🇵🇦', name: 'Panama' },
    { code: '+53',   flag: '🇨🇺', name: 'Cuba' },
    { code: '+1809', flag: '🇩🇴', name: 'Dominican Republic' },
    { code: '+509',  flag: '🇭🇹', name: 'Haiti' },
    { code: '+593',  flag: '🇪🇨', name: 'Ecuador' },
    { code: '+591',  flag: '🇧🇴', name: 'Bolivia' },
    { code: '+595',  flag: '🇵🇾', name: 'Paraguay' },
    { code: '+598',  flag: '🇺🇾', name: 'Uruguay' },
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
