import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AdminService } from '../../services/admin.service';
import { UserEditDialog, UserEditData } from './user-edit-dialog/user-edit-dialog';

@Component({
  standalone: true,
  selector: 'app-admin-users',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <!-- FORMULAIRE CREATION -->
    <mat-card style="margin-bottom:16px">
      <mat-card-title style="text-align:center">Créer un utilisateur</mat-card-title>
      <mat-card-content>
        <form (ngSubmit)="create()" class="create-grid">
          <mat-form-field appearance="outline">
            <mat-label>Nom</mat-label>
            <input matInput [(ngModel)]="name" name="name" required minlength="2">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Prénom</mat-label>
            <input matInput [(ngModel)]="prenom" name="prenom">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput [(ngModel)]="email" name="email" required type="email">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Mot de passe</mat-label>
            <input matInput [(ngModel)]="password" name="password" required minlength="6" type="password">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Confirmer le mot de passe</mat-label>
            <input matInput [(ngModel)]="confirmPassword" name="confirmPassword" required minlength="6" type="password">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Rôle</mat-label>
            <mat-select [(ngModel)]="role" name="role" required>
              <mat-option value="visitor">Visitor</mat-option>
              <mat-option value="admin">Admin</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="actions">
            <button mat-raised-button color="primary" type="submit">Créer</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>

    <!-- TABLEAU -->
    <mat-card>
      <mat-card-title>Utilisateurs</mat-card-title>
      <mat-card-content>
        <table mat-table [dataSource]="users" class="mat-elevation-z2 full">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Nom</th>
            <td mat-cell *matCellDef="let u">{{u.name}} {{u.surname}}</td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let u">{{u.email}}</td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Rôle</th>
            <td mat-cell *matCellDef="let u">
              {{u.role}}
              <span *ngIf="!u.is_active" style="margin-left:8px" class="muted">(inactif)</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let u">
              <mat-slide-toggle [checked]="u.is_active" (change)="onToggle(u)">
                {{ u.is_active ? 'Actif' : 'Inactif' }}
              </mat-slide-toggle>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let u">
              <button mat-icon-button (click)="openEditDialog(u)" aria-label="Éditer">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="remove(u)" aria-label="Supprimer">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" [class.inactive-row]="!row.is_active"></tr>
        </table>

        <div *ngIf="!users.length" style="text-align:center; padding:16px; color:#777;">
          Aucun utilisateur.
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .create-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px,1fr));
      gap: 12px;
      align-items: end;
    }
    .actions { display:flex; justify-content:flex-end }
    .full { width:100%; }
    .inactive-row { opacity: .55; }
    .muted { color:#888; font-size: 12px; }
  `]
})
export class AdminUsersPage {
  private api = inject(AdminService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Création
  name = '';
  prenom = '';
  email = '';
  password = '';
  confirmPassword = '';
  role: 'admin' | 'visitor' = 'visitor';

  // Liste
  users: any[] = [];
  // Doivent correspondre aux <ng-container matColumnDef="...">
  displayedColumns = ['name','email','role','status','actions'];

  ngOnInit() { this.refresh(); }

  refresh() {
    this.api.listUsers().subscribe({
      next: (rows: any) => this.users = rows,
      error: () => this.snack.open('Erreur chargement utilisateurs', 'Fermer', { duration: 2000 })
    });
  }

  create() {
    if (this.password !== this.confirmPassword) {
      this.snack.open('Les mots de passe ne correspondent pas', 'Fermer', { duration: 2000 });
      return;
    }
    this.api.createUser({
      name: this.name, surname: this.prenom, email: this.email,
      password: this.password, role: this.role
    }).subscribe({
      next: () => {
        this.snack.open('Utilisateur créé', 'OK', { duration: 1600 });
        this.name = this.prenom = this.email = this.password = this.confirmPassword = '';
        this.role = 'visitor';
        this.refresh();
      },
      error: err => this.snack.open(err?.error?.message || 'Création impossible', 'Fermer', { duration: 2200 })
    });
  }

  openEditDialog(u: any) {
    const data: UserEditData = {
      id: u.id,
      name: u.name,
      surname: u.surname,
      email: u.email,
      role: u.role,
      is_active: !!u.is_active
    };

    this.dialog.open(UserEditDialog, { width: '520px', data }).afterClosed().subscribe((result) => {
      if (!result) return;

      // 1) maj des champs principaux
      this.api.updateUser(result.id, {
        name: result.name,
        surname: result.surname,
        email: result.email,
        role: result.role
      }).subscribe({
        next: () => {
          // 2) maj éventuelle du statut actif
          const needsToggle = u.is_active !== result.is_active;
          if (needsToggle) {
            this.api.setActive(result.id, result.is_active).subscribe({
              next: () => { this.snack.open('Utilisateur mis à jour', 'OK', { duration: 1500 }); this.refresh(); },
              error: () => { this.snack.open('Échec mise à jour statut', 'Fermer', { duration: 2000 }); this.refresh(); }
            });
          } else {
            this.snack.open('Utilisateur mis à jour', 'OK', { duration: 1500 });
            this.refresh();
          }
        },
        error: err => this.snack.open(err?.error?.message || 'Modification impossible', 'Fermer', { duration: 2000 })
      });
    });
  }

  remove(u: any) {
    if (!confirm(`Supprimer l'utilisateur ${u.email} ?`)) return;
    this.api.deleteUser(u.id).subscribe({
      next: () => { this.snack.open('Utilisateur supprimé', 'OK', { duration: 1500 }); this.refresh(); },
      error: err => this.snack.open(err?.error?.message || 'Suppression impossible', 'Fermer', { duration: 2000 })
    });
  }

  onToggle(u: any) {
    const next = !u.is_active;
    const prev = u.is_active;
    u.is_active = next; // optimiste

    this.api.setActive(u.id, next).subscribe({
      next: () => this.snack.open(next ? 'Activé' : 'Désactivé', 'OK', { duration: 1200 }),
      error: () => { u.is_active = prev; this.snack.open('Échec de mise à jour du statut', 'Fermer', { duration: 2000 }); }
    });
  }
}
