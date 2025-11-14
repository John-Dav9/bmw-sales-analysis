import {
  ApplicationConfig,
  APP_INITIALIZER,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';

import { routes } from './app.routes';
import { httpInterceptorProviders } from './core/interceptors';
import { InactivityService } from './core/session/inactivity.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // HTTP client (utilise Fetch API) + intercepteurs déclarés via DI
    provideHttpClient(
      withInterceptorsFromDi(),
      withFetch()
    ),
    httpInterceptorProviders, // ← doit fournir AuthTokenInterceptor & UnauthInterceptor

    // Router + preloading
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // Angular Material animations
    provideAnimations(),

    // Globaux & perfs
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Snackbar par défaut
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 3000 } },

    // Auto-logout / inactivité (30 min) — démarre au bootstrap
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [InactivityService],
      useFactory: (idle: InactivityService) => () => idle.init(),
    },
  ],
};
