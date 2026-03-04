import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { BlogDto, PagedResult } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private api = inject(ApiService);

  getBlogs(page: number = 1, limit: number = 12, name?: string): Observable<PagedResult<BlogDto>> {
    const params: any = { page, limit };
    if (name) params.name = name;
    return this.api.get<PagedResult<BlogDto>>('/proxy/web/blog/paged', params);
  }

  getBlog(slug: string): Observable<BlogDto> {
    return this.api.get<BlogDto>(`/proxy/web/blog/slug/${slug}`);
  }
}
