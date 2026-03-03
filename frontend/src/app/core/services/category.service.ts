import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CategoryDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private api = inject(ApiService);

  getAll(locale?: string): Observable<CategoryDto[]> {
    return this.api.get<CategoryDto[]>('/proxy/web/category', locale ? { locale } : undefined);
  }

  getAttributes(slug: string, locale?: string): Observable<any[]> {
    return this.api.get<any[]>(`/proxy/web/category/${slug}/attributes`, locale ? { locale } : undefined);
  }
}
