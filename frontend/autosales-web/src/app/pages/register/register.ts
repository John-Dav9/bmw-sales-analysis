import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatInputModule, MatButtonModule, MatSelectModule, MatSnackBarModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
   private http = inject(HttpClient);
  private snack = inject(MatSnackBar);
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  surname = '';
  email = '';
  password = '';
  confirmPassword = '';
  role: 'admin' | 'visitor' = 'visitor';
  loading = false;

  async register() {
    if (this.password !== this.confirmPassword) {
      this.snack.open('Les mots de passe ne correspondent pas', 'Fermer', { duration: 2500 });
      return;
    }

    this.loading = true;
    try {
      const resp: any = await firstValueFrom(
        this.http.post(`${environment.apiBase}/auth/register`, {
          name: this.name,
          surname: this.surname,
          email: this.email,
          password: this.password,
          role: this.role
        })
      );

      this.auth.saveSession(resp.access_token, resp.user);
      this.snack.open('Inscription réussie !', 'OK', { duration: 2000 });

      if (resp.user?.role === 'admin') this.router.createUrlTree(['/admin']);
      else this.router.createUrlTree(['/']);
    } catch (err: any) {
      this.snack.open(err?.error?.message || 'Erreur lors de l’inscription', 'Fermer', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }
}
