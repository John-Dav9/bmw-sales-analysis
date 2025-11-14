// src/app/core/auth/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Guard: utilisateur connecté requis */
export const authGuardCanMatch: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

export const authGuardCanActivate: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

/** Guard: admin requis */
export const adminGuardCanMatch: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return (auth.isLoggedIn() && auth.isAdmin())
    ? true
    : router.createUrlTree(['/']);
};

export const adminGuardCanActivate: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return (auth.isLoggedIn() && auth.isAdmin())
    ? true
    : router.createUrlTree(['/']);
};
