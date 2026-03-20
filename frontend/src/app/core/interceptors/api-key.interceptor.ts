import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyInterceptor implements HttpInterceptor {
  // Keys loaded from environment variables (server-side only — browser uses /ext proxy)
  private readonly PARTNER_KEY: string = (typeof process !== 'undefined' && process.env?.['PARTNER_KEY']) || '';
  private readonly API_BASE: string = (typeof process !== 'undefined' && process.env?.['API_BASE_URL']) || 'https://api-prod.optowire.net';

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only add header for direct external API requests (SSR only — browser uses /ext proxy)
    if (this.PARTNER_KEY && req.url.startsWith(this.API_BASE)) {
      const cloned = req.clone({
        setHeaders: { 'x-partner-key': this.PARTNER_KEY }
      });
      return next.handle(cloned);
    }
    return next.handle(req);
  }
}
