import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { BlogPost } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private api = inject(ApiService);

  getPaged(page: number = 1, limit: number = 10): Observable<any> {
    return this.api.get<any>('/web/blog/paged', { page, limit });
  }

  getBySlug(slug: string): Observable<BlogPost> {
    return this.api.get<BlogPost>(`/web/blog/${slug}`);
  }
}
