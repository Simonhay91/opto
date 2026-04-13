import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { BrandDto } from '../models/models';

const CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class BrandService {
  private api = inject(ApiService);
  private cache$: Observable<BrandDto[]> | null = null;
  private cacheTime = 0;

  getAll(): Observable<BrandDto[]> {
    const now = Date.now();
    if (!this.cache$ || now - this.cacheTime > CACHE_TTL_MS) {
      this.cacheTime = now;
      this.cache$ = this.api.get<BrandDto[]>('/web/brand').pipe(shareReplay(1));
    }
    return this.cache$;
  }

  getBySlug(slug: string): Observable<BrandDto> {
    return this.api.get<BrandDto>(`/web/brand/${slug}`);
  }
}
