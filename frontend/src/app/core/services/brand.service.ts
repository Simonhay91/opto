import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { BrandDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private api = inject(ApiService);

  getAll(): Observable<BrandDto[]> {
    return this.api.get<BrandDto[]>('/web/brand');
  }

  getBySlug(slug: string): Observable<BrandDto> {
    return this.api.get<BrandDto>(`/web/brand/${slug}`);
  }
}
