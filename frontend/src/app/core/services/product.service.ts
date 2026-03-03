import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ProductDto, ProductCriteriaDto, PagedResult, SliderDto, SectionDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = inject(ApiService);

  getSliders(): Observable<SliderDto[]> {
    return this.api.get<SliderDto[]>('/proxy/web/sliders');
  }

  getPromotionalUnits(params?: { startDate?: string; endDate?: string }): Observable<any[]> {
    return this.api.get<any[]>('/proxy/web/promotional-unit', params);
  }

  getSections(): Observable<SectionDto[]> {
    return this.api.get<SectionDto[]>('/proxy/web/section');
  }

  getSectionProducts(sectionId: string, criteria: ProductCriteriaDto = {}): Observable<PagedResult<ProductDto> | ProductDto[]> {
    return this.api.post<any>(`/proxy/web/product/section/${sectionId}`, criteria);
  }

  explore(criteria: ProductCriteriaDto): Observable<PagedResult<ProductDto>> {
    return this.api.post<PagedResult<ProductDto>>('/proxy/web/product/explore', criteria);
  }

  getProduct(slug: string): Observable<ProductDto> {
    return this.api.get<ProductDto>(`/proxy/web/product/${slug}`);
  }

  getPartner(): Observable<any> {
    return this.api.get<any>('/proxy/web/partner/self');
  }

  getCurrencies(): Observable<any[]> {
    return this.api.get<any[]>('/proxy/web/currency');
  }
}
