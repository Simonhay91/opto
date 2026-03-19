import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { CategoryDto } from '../models/models';

// Only these 4 categories are supported across the entire application
const ALLOWED_CATEGORY_IDS = new Set([1, 91, 188, 212]);

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private api = inject(ApiService);

  getAll(): Observable<CategoryDto[]> {
    return this.api.get<CategoryDto[]>('/web/category').pipe(
      map(cats => cats.filter(c => ALLOWED_CATEGORY_IDS.has(Number(c.id))))
    );
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

        const flat = flattenCategories(categories);
        // Try exact match first, then match by last slug segment
        const found = flat.find(c => c.slug === slug)
          ?? flat.find(c => c.slug?.split('/').pop() === slug);
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
