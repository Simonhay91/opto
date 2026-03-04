import { Injectable, inject, PLATFORM_ID, Inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ProductDto, getImageUrl } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);
  private doc = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

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
    const imgUrl = getImageUrl(mainImg, 'large');
    if (imgUrl && !imgUrl.includes('no-image')) {
      this.meta.updateTag({ property: 'og:image', content: imgUrl });
    }

    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: desc,
      sku: product.crmCode,
      model: product.model,
      brand: { '@type': 'Brand', name: product.brandName || 'Optowire' },
      image: imgUrl,
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
    this.injectJsonLd(schema, 'product-schema');
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
    this.injectJsonLd(schema, 'organization-schema');
  }

  setCatalogSchema(name: string, description: string) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name,
      description,
      publisher: { '@type': 'Organization', name: 'Optowire' },
    };
    this.injectJsonLd(schema, 'catalog-schema');
  }

  setArticleSchema(title: string, description: string, imageUrl: string, publishedDate: string, author: string) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      image: imageUrl,
      datePublished: publishedDate,
      author: {
        '@type': 'Person',
        name: author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Optowire',
        logo: {
          '@type': 'ImageObject',
          url: 'https://optowire.net/assets/logo.png',
        },
      },
    };
    this.injectJsonLd(schema, 'article-schema');
  }

  /**
   * Inject JSON-LD schema into <head>
   * Works in both server-side and client-side contexts
   */
  private injectJsonLd(data: object, id: string) {
    // Only manipulate DOM if we have a document
    if (!this.doc) return;
    
    try {
      // Remove existing schema with same ID
      const existing = this.doc.head?.querySelector(`script[id="${id}"]`);
      if (existing) {
        existing.remove();
      }
      
      // Create and inject new schema
      const script = this.doc.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data);
      this.doc.head?.appendChild(script);
    } catch (e) {
      // Silently fail if DOM manipulation not available
      console.error('Failed to inject JSON-LD:', e);
    }
  }
}
