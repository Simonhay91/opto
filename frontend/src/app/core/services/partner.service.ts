import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PartnerService {
  private api = inject(ApiService);

  submitApplication(data: any): Observable<any> {
    return this.api.post<any>('/web/become-partner', data);
  }

  submitQuote(data: any): Observable<any> {
    return this.api.post<any>('/web/checkout/global-preorder', data);
  }
}
