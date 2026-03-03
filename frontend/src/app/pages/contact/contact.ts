import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { LangService } from '../../core/services/lang.service';
import { SeoService } from '../../core/services/seo.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './contact.html',
})
export class ContactComponent implements OnInit {
  lang = inject(LangService);
  private seo = inject(SeoService);
  private api = inject(ApiService);

  state = signal<'form' | 'loading' | 'success' | 'error'>('form');

  form = { name: '', email: '', companyName: '', phone: '', message: '' };

  contactInfo = {
    phone: '+86 150 9215 7630',
    email: 'info@optowire.net',
    address: '2/F, East Office Building, No. 45 Beijing Road, Qianwan Free Trade Port Area, Qingdao, China',
    addressZh: '中国青岛前湾自由贸易港区北京路45号东办公楼2楼',
    city: 'Qingdao · 青岛',
    country: 'People\'s Republic of China · 中华人民共和国',
  };

  ngOnInit() {
    this.seo.setPage('Contact Us', 'Contact Optowire — fiber optic cable manufacturer in Qingdao, China. Phone: +86 150 9215 7630 | Email: info@optowire.net');
  }

  submit(f: NgForm) {
    if (f.invalid) return;
    this.state.set('loading');
    this.api.post('/proxy/web/project-inquiry', {
      type: 'general',
      name: this.form.name,
      email: this.form.email,
      companyName: this.form.companyName || undefined,
      phone: this.form.phone || undefined,
      message: this.form.message,
    }).subscribe({
      next: () => this.state.set('success'),
      error: () => this.state.set('error'),
    });
  }
}
