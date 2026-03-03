import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LangService } from '../../core/services/lang.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterLink],
  templateUrl: './about.html',
})
export class AboutComponent implements OnInit {
  lang = inject(LangService);
  private seo = inject(SeoService);
  private ps = inject(ProductService);

  partner = signal<any>(null);

  stats = [
    { num: '20+', en: 'Years Experience', zh: '年经验' },
    { num: '50+', en: 'Countries Served', zh: '服务国家' },
    { num: '5000+', en: 'Products', zh: '产品种类' },
    { num: 'ISO', en: 'Certified', zh: '认证' },
  ];

  values = [
    { en: 'Quality First', zh: '质量第一', desc: 'ISO-certified manufacturing with rigorous QC at every stage.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { en: 'Innovation', zh: '创新驱动', desc: 'Continuous R&D to deliver cutting-edge fiber optic solutions.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { en: 'Global Reach', zh: '全球服务', desc: 'Serving telecom operators and enterprises in 50+ countries.', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064' },
    { en: 'OEM / ODM', zh: '定制生产', desc: 'Custom manufacturing solutions tailored to your specifications.', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  categories = [
    { en: 'Telecommunication', zh: '电信', desc: 'FTTH, ODN, fiber cables, closures, distribution boxes' },
    { en: 'Network Equipment', zh: '网络设备', desc: 'Switches, transceivers, patch panels, cabinets' },
    { en: 'Security Systems', zh: '安防系统', desc: 'CCTV cameras, access control, video surveillance' },
    { en: 'IoT Solutions', zh: '物联网', desc: 'Smart sensors, connected devices, monitoring systems' },
  ];

  ngOnInit() {
    this.seo.setPage('About Optowire', 'Optowire is a leading fiber optic cable manufacturer headquartered in Qingdao, China. ISO certified, serving 50+ countries.');
    this.ps.getPartner().subscribe({
      next: (p: any) => this.partner.set(p),
      error: () => {}
    });
    this.injectAboutSchema();
  }

  private injectAboutSchema() {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Optowire',
      alternateName: 'Planet Fiber',
      url: 'https://optowire.net',
      description: 'Leading fiber optic cable manufacturer in Qingdao, China.',
      address: { '@type': 'PostalAddress', addressLocality: 'Qingdao', addressCountry: 'CN' },
      foundingLocation: { '@type': 'Place', name: 'Qingdao, China' },
    };
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
  }
}
