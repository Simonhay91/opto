import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { BrandDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private api = inject(ApiService);

  getAll(): Observable<BrandDto[]> {
    return this.api.get<BrandDto[]>('/proxy/web/brand');
  }

  getByCategory(categoryId: string): Observable<BrandDto[]> {
    return this.api.get<BrandDto[]>(`/proxy/web/brand/category/${categoryId}`);
  }

  getDetail(slug: string, locale?: string): Observable<any> {
    return this.api.get<any>(`/proxy/web/brand/${slug}`, locale ? { locale } : undefined);
  }
}
