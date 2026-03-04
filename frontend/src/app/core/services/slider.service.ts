import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Slider } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SliderService {
  private api = inject(ApiService);

  getAll(): Observable<Slider[]> {
    return this.api.get<Slider[]>('/proxy/web/sliders');
  }

  getById(id: number): Observable<Slider> {
    return this.api.get<Slider>(`/proxy/web/sliders/${id}`);
  }
}
