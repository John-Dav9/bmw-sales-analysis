import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header {
  menuOpen = false;

  constructor(public auth: AuthService) {}

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  closeMenu() { this.menuOpen = false; }

  logout() {
    this.auth.logout(); // ✅ le service gère la redirection automatique
  }
}
