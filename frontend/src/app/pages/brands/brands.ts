import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LangService } from '../../core/services/lang.service';
import { SeoService } from '../../core/services/seo.service';
import { BrandService } from '../../core/services/brand.service';
import { BrandDto } from '../../core/models/models';

@Component({
  selector: 'app-brands',
  imports: [CommonModule, RouterLink],
  templateUrl: './brands.html',
})
export class BrandsComponent implements OnInit {
  lang = inject(LangService);
  private seo = inject(SeoService);
  private bs = inject(BrandService);

  brands = signal<BrandDto[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.seo.setPage('Our Brands', 'Explore all brands available at Optowire — fiber optic and network equipment from leading manufacturers.');
    this.bs.getAll().subscribe({
      next: (data: any) => {
        const arr = Array.isArray(data) ? data : data?.items || [];
        this.brands.set(arr);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getBrandLogo(brand: BrandDto): string {
    const logo = (brand as any).logo || (brand as any).logoImage;
    if (!logo) return '';
    if (typeof logo === 'string') return logo;
    if (logo?.url) return logo.url;
    if (logo?.path) return `https://api-prod.optowire.net/${logo.path}`;
    if (logo?.optimizedPath) return `https://api-prod.optowire.net/${logo.optimizedPath}`;
    return '';
  }
}
