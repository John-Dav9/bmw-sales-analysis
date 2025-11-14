import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin').then(m => m.AdminPage), // /admin
    children: [
      {
        path: 'users',
        loadComponent: () => import('./users').then(m => m.AdminUsersPage) // /admin/users
      },
      { path: '**', redirectTo: 'users' }
    ]
  }
];
