import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { LangService } from '../../core/services/lang.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterLink],
  templateUrl: './about.html',
})
export class AboutComponent implements OnInit {
  lang = inject(LangService);
  private seo = inject(SeoService);
  private doc = inject(DOCUMENT);

  contact = {
    phone: '+86 150 9215 7630',
    email: 'info@optowire.net',
    address: '2/F, East Office Building, No. 45 Beijing Road, Qianwan Free Trade Port Area, Qingdao, China',
    addressZh: '青岛前湾自由贸易港区北京路45号东办公楼2楼',
  };

  stats = [
    { num: '20+', en: 'Years Experience', zh: '年经验' },
    { num: '50+', en: 'Countries Served', zh: '服务国家' },
    { num: '5000+', en: 'Products', zh: '产品种类' },
    { num: 'ISO', en: 'Certified', zh: '认证' },
  ];

  industries = [
    { en: 'Telecommunications', zh: '电信', icon: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0' },
    { en: 'Data Communications', zh: '数据通信', icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01' },
    { en: 'Smart Infrastructure', zh: '智慧基础设施', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { en: 'Aerospace', zh: '航空航天', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
    { en: 'Security Systems', zh: '安防系统', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { en: 'IoT Solutions', zh: '物联网', icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18' },
  ];

  strengths = [
    {
      en: 'R&D Foundation',
      zh: '研发基础',
      desc: 'Deep technical expertise driving continuous innovation across product lines.',
      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    },
    {
      en: 'Manufacturing Excellence',
      zh: '制造卓越',
      desc: 'Advanced production capabilities with strict quality control at every stage.',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    },
    {
      en: 'International Standards',
      zh: '国际标准',
      desc: 'Every product certified by reputable international institutions and regulatory bodies.',
      icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    },
    {
      en: 'Partnership-Driven',
      zh: '合作共赢',
      desc: 'Long-term, sustainable relationships with telecom operators, integrators, and enterprises.',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
      en: 'OEM / ODM',
      zh: '定制生产',
      desc: 'Custom manufacturing tailored to your exact specifications and project requirements.',
      icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
    },
    {
      en: 'Global Reach',
      zh: '全球服务',
      desc: 'Serving customers in 50+ countries with worldwide logistics and technical support.',
      icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064',
    },
  ];

  ngOnInit() {
    this.seo.setPage(
      'About OPTOWIRE',
      'OPTOWIRE is a leading supplier of telecommunications infrastructure, security systems, IoT, and high-tech enterprise solutions headquartered in Qingdao, China.'
    );
    this.injectSchema();
  }

  private injectSchema() {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'OPTOWIRE',
      description: 'Leading supplier of telecommunications infrastructure, security systems, IoT, and high-tech enterprise solutions.',
      url: 'https://optowire.net',
      address: { '@type': 'PostalAddress', streetAddress: '2/F, East Office Building, No. 45 Beijing Road, Qianwan Free Trade Port Area', addressLocality: 'Qingdao', addressCountry: 'CN' },
      telephone: '+8615092157630',
      email: 'info@optowire.net',
    };
    if (!this.doc?.head) return;
    const s = this.doc.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(schema);
    this.doc.head.appendChild(s);
  }
}
