import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from '../model/service/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  // O token só pode ir para a nossa API; URLs absolutas de terceiros (ex.: IBGE) não o recebem.
  private isExternal(url: string): boolean {
    return /^https?:\/\//i.test(url) && !url.startsWith(environment.apiUrl);
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.isExternal(req.url) ? null : this.authService.getToken();

    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: unknown) => {
        // Normalize Angular dev-proxy string errors into a proper HttpErrorResponse
        const httpErr = error as HttpErrorResponse;
        if (typeof httpErr?.error === 'string' && httpErr.error.toLowerCase().includes('proxy')) {
          const normalized = new HttpErrorResponse({
            error: { message: httpErr.error },
            status: 0,
            statusText: 'Network Error',
            url: req.url
          });
          return throwError(() => normalized);
        }
        return throwError(() => error);
      })
    );
  }
}
