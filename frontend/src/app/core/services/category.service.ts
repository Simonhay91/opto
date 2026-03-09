import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CategoryDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private api = inject(ApiService);

  getAll(): Observable<CategoryDto[]> {
    return this.api.get<CategoryDto[]>('/web/category');
  }

  getBySlug(slug: string): Observable<CategoryDto> {
    return this.api.get<CategoryDto>(`/web/category/${slug}`);
  }

  getAttributes(slug: string): Observable<any[]> {
    return this.api.get<any[]>(`/web/category/${slug}/attributes`);
  }
}
