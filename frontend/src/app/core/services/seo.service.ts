import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { ProductDto, getImageUrl } from '../models/models';

const SITE_BASE = 'https://optowire.net';
const DEFAULT_OG_IMAGE = `${SITE_BASE}/assets/images/optowire-logo.png`;

@Injectable({ providedIn: 'root' })
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);
  private doc = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  setPage(titleStr: string, description: string, ogImage?: string) {
    const fullTitle = `${titleStr} | Optowire`;
    const image = ogImage || DEFAULT_OG_IMAGE;

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:site_name', content: 'Optowire' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    this.setCanonical();
  }

  setCanonical(path?: string) {
    const cleanPath = (path || this.router.url || '/').split('?')[0];
    const url = `${SITE_BASE}${cleanPath}`;
    this.meta.updateTag({ property: 'og:url', content: url });

    if (!this.doc?.head) return;
    let link = this.doc.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link') as HTMLLinkElement;
      link.rel = 'canonical';
      this.doc.head.appendChild(link);
    }
    link.href = url;
  }

  setProductSchema(product: ProductDto) {
    this.title.setTitle(`${product.name} | Optowire`);
    const desc = product.description?.replace(/<[^>]*>/g, '').substring(0, 160) || product.name;
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:title', content: `${product.name} | Optowire` });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:type', content: 'product' });

    const mainImg = product.images?.find(i => i.id === product.mainImageId) || product.images?.[0];
    const imgUrl = getImageUrl(mainImg, 'large');
    const finalImg = (imgUrl && !imgUrl.includes('no-image')) ? imgUrl : DEFAULT_OG_IMAGE;
    this.meta.updateTag({ property: 'og:image', content: finalImg });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: `${product.name} | Optowire` });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
    this.meta.updateTag({ name: 'twitter:image', content: finalImg });
    this.setCanonical();

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

  setFaqSchema(faqs: { question: string; answer: string }[]) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    };
    this.injectJsonLd(schema, 'faq-schema');
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
