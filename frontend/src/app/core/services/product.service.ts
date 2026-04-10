import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ProductDto, ProductCriteriaDto, PagedResult, SliderDto, SectionDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = inject(ApiService);

  getSliders(): Observable<SliderDto[]> {
    return this.api.get<SliderDto[]>('/web/sliders');
  }

  getPromotionalUnits(params?: { startDate?: string; endDate?: string }): Observable<any[]> {
    return this.api.get<any[]>('/web/promotional-unit', params);
  }

  getSections(): Observable<SectionDto[]> {
    return this.api.get<SectionDto[]>('/web/section');
  }

  getSectionProducts(sectionId: string, _criteria: ProductCriteriaDto = {}): Observable<PagedResult<ProductDto> | ProductDto[]> {
    return this.api.get<any>(`/web/product/section/${sectionId}`);
  }

  explore(criteria: ProductCriteriaDto): Observable<PagedResult<ProductDto>> {
    return this.api.post<PagedResult<ProductDto>>('/web/product/explore', criteria);
  }

  getProduct(slug: string): Observable<ProductDto> {
    return this.api.get<ProductDto>(`/web/product/${slug}`);
  }

  getPartner(): Observable<any> {
    return this.api.get<any>('/web/partner/self');
  }

  getCurrencies(): Observable<any[]> {
    return this.api.get<any[]>('/web/currency');
  }
}
