import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, throwError } from 'rxjs';
import { LoaderService } from '../loader/loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class HttpLoadingInterceptor implements HttpInterceptor {
  private loader = inject(LoaderService);
  private snack  = inject(MatSnackBar);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // ignore optionnel: fichiers lourds, assets etc.
    const skip = req.headers.get('x-skip-loader') === '1' || req.url.includes('/assets/');
    if (!skip) this.loader.show();

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        const msg = err.error?.message || err.statusText || 'Erreur réseau';
        this.snack.open(`❌ ${msg}`, 'Fermer', { duration: 5000, panelClass: ['snack-error'] });
        return throwError(() => err);
      }),
      finalize(() => { if (!skip) this.loader.hide(); })
    );
  }
}
