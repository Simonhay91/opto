import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyInterceptor implements HttpInterceptor {
  private readonly PARTNER_KEY = '94fa5fc3-9534-4bb5-8722-f724f84a5594';
  private readonly API_BASE = 'https://api-prod.optowire.net';

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only add header for external API requests
    if (req.url.startsWith(this.API_BASE)) {
      const cloned = req.clone({
        setHeaders: {
          'x-partner-key': this.PARTNER_KEY
        }
      });
      return next.handle(cloned);
    }
    
    return next.handle(req);
  }
}
