import { Routes, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { Dashboard } from './pages/dashboard/dashboard';
import { Explore } from './pages/explore/explore';
import { About } from './pages/about/about';
import { Insights } from './pages/insights/insights';
import { Methodo } from './pages/methodo/methodo';
import { Usecases } from './pages/usecases/usecases';
import { DataStory } from './pages/datastory/datastory';
import { AuthService } from './core/auth/auth.service';

import {
  authGuardCanMatch, adminGuardCanMatch,
  authGuardCanActivate, adminGuardCanActivate
} from './core/auth/auth.guard';

function landingRedirect(): true | UrlTree {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? router.parseUrl('/dashboard') : true;
}

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'landing' },

  // Public
  { path: 'landing', loadComponent: () => import('./pages/landing/landing').then(m => m.Landing), canMatch: [landingRedirect] },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },

  // Visiteur (auth requis)
  { path: 'dashboard', canActivate: [authGuardCanActivate], component: Dashboard },
  { path: 'insights', canActivate: [authGuardCanActivate], component: Insights },
  { path: 'methodo', canActivate: [authGuardCanActivate], component: Methodo },
  { path: 'data-story', canActivate: [authGuardCanActivate], component: DataStory },
  { path: 'use-cases', canActivate: [authGuardCanActivate], component: Usecases },

  // Admin only
  { path: 'explore', canActivate: [authGuardCanActivate, adminGuardCanActivate], component: Explore },
  { path: 'about', canActivate: [authGuardCanActivate, adminGuardCanActivate], component: About },
  {
    path: 'admin',
    canActivate: [authGuardCanActivate, adminGuardCanActivate],
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.adminRoutes)
  },

  { path: '**', redirectTo: 'landing' },
];
