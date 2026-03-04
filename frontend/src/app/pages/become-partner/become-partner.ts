import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PartnerService } from '../../core/services/partner.service';
import { LangService } from '../../core/services/lang.service';
import { SeoService } from '../../core/services/seo.service';
import { BecomePartner } from '../../core/models/models';

@Component({
  selector: 'app-become-partner',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './become-partner.html',
})
export class BecomePartnerComponent {
  private partnerService = inject(PartnerService);
  private seo = inject(SeoService);
  lang = inject(LangService);

  formData: BecomePartner = {
    name: '',
    email: '',
    message: '',
    partnershipType: 'INDIVIDUAL',
    partnershipAim: 'DISCOUNT'
  };

  loading = signal(false);
  submitted = signal(false);
  error = signal<string | null>(null);

  partnershipTypes = [
    { value: 'INDIVIDUAL', label: 'Individual' },
    { value: 'SMALL_BUSINESS', label: 'Small Business' },
    { value: 'LARGE_BUSINESS', label: 'Large Business' }
  ];

  partnershipAims = [
    { value: 'DISCOUNT', label: 'Get Discounts' },
    { value: 'MARKETING_COLLABORATION', label: 'Marketing Collaboration' },
    { value: 'BULK_ORDERS', label: 'Bulk Orders' },
    { value: 'REFERRALS', label: 'Referral Program' }
  ];

  ngOnInit() {
    this.seo.setPage(
      'Become Our Partner - Optowire',
      'Join Optowire partnership program. Get exclusive discounts, marketing support, and grow your business with us.'
    );
  }

  onSubmit() {
    // Basic validation
    if (!this.formData.name || !this.formData.email) {
      this.error.set('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.error.set('Please enter a valid email address');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.partnerService.becomePartner(this.formData).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
        // Reset form
        this.formData = {
          name: '',
          email: '',
          message: '',
          partnershipType: 'INDIVIDUAL',
          partnershipAim: 'DISCOUNT'
        };
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Failed to submit application. Please try again.');
      }
    });
  }

  resetSuccess() {
    this.submitted.set(false);
  }
}
