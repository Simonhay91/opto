import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { ProductDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);
  private doc = inject(DOCUMENT);

  setPage(titleStr: string, description: string) {
    this.title.setTitle(`${titleStr} | Optowire`);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: `${titleStr} | Optowire` });
    this.meta.updateTag({ property: 'og:description', content: description });
  }

  setProductSchema(product: ProductDto) {
    this.title.setTitle(`${product.name} | Optowire`);
    const desc = product.description?.replace(/<[^>]*>/g, '').substring(0, 160) || product.name;
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:title', content: `${product.name} | Optowire` });
    this.meta.updateTag({ property: 'og:description', content: desc });

    const mainImg = product.images?.find(i => i.id === product.mainImageId) || product.images?.[0];
    if (mainImg) this.meta.updateTag({ property: 'og:image', content: mainImg.url });

    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: desc,
      sku: product.crmCode,
      model: product.model,
      brand: { '@type': 'Brand', name: product.brandName || 'Optowire' },
      image: mainImg?.url,
      offers: {
        '@type': 'Offer',
        availability: (product.stockAmount ?? 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        priceCurrency: product.pricingInfo?.currency || 'USD',
        price: product.pricingInfo?.tiers?.[0]?.price || product.pricingInfo?.basePrice || 0,
        seller: { '@type': 'Organization', name: 'Optowire' },
      },
    };
    this.injectJsonLd(schema);
  }

  setOrganizationSchema() {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Optowire',
      alternateName: 'Planet Fiber',
      url: 'https://optowire.net',
      description: 'Leading fiber optic cable manufacturer based in Qingdao, China.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Qingdao',
        addressCountry: 'CN',
      },
      foundingLocation: { '@type': 'Place', name: 'Qingdao, China' },
    };
    this.injectJsonLd(schema);
  }

  setCatalogSchema(name: string, description: string) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name,
      description,
      publisher: { '@type': 'Organization', name: 'Optowire' },
    };
    this.injectJsonLd(schema);
  }

  private injectJsonLd(data: object) {
    const existing = this.doc.head.querySelector('script[type="application/ld+json"]');
    if (existing) existing.remove();
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    this.doc.head.appendChild(script);
  }
}
