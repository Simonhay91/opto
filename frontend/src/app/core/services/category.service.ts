import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CategoryDto, CategoryAttributesDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private api = inject(ApiService);

  getAll(locale?: string): Observable<CategoryDto[]> {
    return this.api.get<CategoryDto[]>('/proxy/web/category', locale ? { locale } : undefined);
  }

  getAttributes(slug: string, locale?: string): Observable<CategoryAttributesDto> {
    return this.api.get<CategoryAttributesDto>(`/proxy/web/category/${slug}/attributes`, locale ? { locale } : undefined);
  }
}
