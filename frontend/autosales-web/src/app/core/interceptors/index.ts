import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthTokenInterceptor } from './auth-token.interceptor';
import { HttpLoadingInterceptor } from './http-loading.interceptor';
import { UnauthInterceptor } from '../http/unauth.interceptor';

export const httpInterceptorProviders = [
  // 1) Ajoute le token avant l’envoi
  { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },

  // 2) Loader global (facultatif) — se déclenche sur req/res
  { provide: HTTP_INTERCEPTORS, useClass: HttpLoadingInterceptor, multi: true },

  // 3) Catch 401/403 → logout + redirection
  { provide: HTTP_INTERCEPTORS, useClass: UnauthInterceptor, multi: true },
];
