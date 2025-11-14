import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatInputModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginPage {
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;

  submit() {
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.auth.saveSession(res.access_token, res.user);
        this.snack.open('✅ Bienvenue !');
        this.router.createUrlTree(['/']);
      },
      error: () => {},
      complete: () => this.loading = false
    });
  }
}
