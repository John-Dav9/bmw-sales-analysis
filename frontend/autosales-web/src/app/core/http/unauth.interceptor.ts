import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UnauthInterceptor implements HttpInterceptor {
  private auth = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        // 401/403 → on force la déconnexion (token expiré / non valide)
        if (err.status === 401 || err.status === 403) {
          this.auth.logout();
        }
        return throwError(() => err);
      })
    );
  }
}
