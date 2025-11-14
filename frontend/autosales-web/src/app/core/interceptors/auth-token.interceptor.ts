import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  private auth = inject(AuthService);
  private router = inject(Router);
  

  intercept(
    req: HttpRequest<any>, 
    next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    if (token != null && token !== '') {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(req).pipe(
      catchError(err => {
        if (err.status === 401 || err.status === 403) {
          this.auth.logout(); // supprime le token
          this.router.navigate(['/login']);
        }
        return throwError(() => err);
      })
    );
  }
}
