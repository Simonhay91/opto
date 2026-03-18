import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { CategoryDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private api = inject(ApiService);

  getAll(): Observable<CategoryDto[]> {
    return this.api.get<CategoryDto[]>('/web/category');
  }

  /**
   * Find a category by its slug by fetching all categories and searching the tree.
   * The external API does not support GET /web/category/:slug (returns 404).
   */
  getBySlug(slug: string): Observable<CategoryDto> {
    return this.getAll().pipe(
      map(categories => {
        const flattenCategories = (cats: CategoryDto[]): CategoryDto[] =>
          cats.reduce((acc: CategoryDto[], cat) => {
            acc.push(cat);
            if (cat.children && cat.children.length > 0) {
              acc.push(...flattenCategories(cat.children));
            }
            return acc;
          }, []);

        const found = flattenCategories(categories).find(c => c.slug === slug);
        if (!found) throw new Error(`Category with slug '${slug}' not found`);
        return found;
      }),
      catchError(err => throwError(() => err))
    );
  }

  getAttributes(slug: string): Observable<any[]> {
    return this.api.get<any[]>(`/web/category/${slug}/attributes`);
  }
}
