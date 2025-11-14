import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-admin',
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule,  ReactiveFormsModule, ],
  template: `
   <router-outlet></router-outlet>
    <mat-card style="max-width: 100%; display: flex; flex-wrap: wrap; gap: 16px; justify-content: space-between;">
      <mat-card-title style="max-width: 480%; display: flex; align-items: center; flex-wrap: wrap;">Admin</mat-card-title>
      <mat-card-content>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a mat-stroked-button color="primary" routerLink="users">Utilisateurs</a>
          <!-- tu pourras rajouter d’autres sous-pages ici -->
        </div>
      </mat-card-content>
    </mat-card>
  
  `
})
export class AdminPage {}
