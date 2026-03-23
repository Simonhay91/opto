import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PartnerService {
  private api = inject(ApiService);
  private http = inject(HttpClient);

  submitApplication(data: any): Observable<any> {
    // Send to our own backend which forwards to Telegram
    return this.http.post<any>('/api/partner-inquiry', data);
  }

  submitQuote(data: any): Observable<any> {
    return this.api.post<any>('/web/checkout/global-preorder', data);
  }
}
