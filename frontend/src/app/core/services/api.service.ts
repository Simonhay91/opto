import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private get base(): string {
    // SSR (server-side): call external API directly — no CORS
    // Browser (client-side): use /api/ext proxy → FastAPI backend (port 8001, works in production K8s)
    return isPlatformServer(this.platformId)
      ? (process.env['API_BASE_URL'] || '')
      : '/api/ext';
  }

  /**
   * GET request with customerId handling
   * First tries with customerId=0, if fails with 400/422, retries without customerId
   */
  get<T>(path: string, params?: Record<string, string | number | boolean | undefined | null>): Observable<T> {
    let p = new HttpParams();
    
    // Add customerId=0 by default
    p = p.set('customerId', '0');
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) p = p.set(k, String(v));
      });
    }
    
    return this.http.get<T>(`${this.base}${path}`, { params: p }).pipe(
      catchError((error: HttpErrorResponse) => {
        // If 400 or 422, retry without customerId
        if (error.status === 400 || error.status === 422) {
          let retryParams = new HttpParams();
          if (params) {
            Object.entries(params).forEach(([k, v]) => {
              if (v !== undefined && v !== null) retryParams = retryParams.set(k, String(v));
            });
          }
          return this.http.get<T>(`${this.base}${path}`, { params: retryParams }).pipe(
            catchError(() => throwError(() => error))
          );
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * POST request with customerId handling
   */
  post<T>(path: string, body: any, params?: Record<string, string | number | boolean | undefined | null>): Observable<T> {
    let p = new HttpParams();
    
    // Add customerId=0 by default
    p = p.set('customerId', '0');
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) p = p.set(k, String(v));
      });
    }
    
    return this.http.post<T>(`${this.base}${path}`, body, { params: p }).pipe(
      catchError((error: HttpErrorResponse) => {
        // If 400 or 422, retry without customerId
        if (error.status === 400 || error.status === 422) {
          let retryParams = new HttpParams();
          if (params) {
            Object.entries(params).forEach(([k, v]) => {
              if (v !== undefined && v !== null) retryParams = retryParams.set(k, String(v));
            });
          }
          return this.http.post<T>(`${this.base}${path}`, body, { params: retryParams }).pipe(
            catchError(() => throwError(() => error))
          );
        }
        return throwError(() => error);
      })
    );
  }
}
