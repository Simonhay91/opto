import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { BecomePartner } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PartnerService {
  private api = inject(ApiService);

  becomePartner(data: BecomePartner): Observable<any> {
    return this.api.post<any>('/proxy/web/become-partner', data);
  }
}
