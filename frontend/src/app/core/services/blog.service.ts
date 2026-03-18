import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private api = inject(ApiService);

  getAll(): Observable<any[]> {
    return this.api.get<any[]>('/web/blog');
  }

  getPaged(page: number = 1, limit: number = 10): Observable<any> {
    return this.api.get<any>('/web/blog/paged', { page, limit });
  }

  /**
   * Find a blog post by slug by fetching all posts.
   * GET /web/blog/:slug returns 401 — use list instead.
   */
  getBySlug(slug: string): Observable<any> {
    return this.getAll().pipe(
      map(posts => {
        const found = posts.find((p: any) => p.slug === slug);
        if (!found) throw new Error(`Blog post '${slug}' not found`);
        return found;
      }),
      catchError(err => throwError(() => err))
    );
  }
}
