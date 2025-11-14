import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export type User = { id: number; email: string; role: 'admin' | 'visitor'; name?: string; surname?: string };
export type LoginResp = { access_token: string; user: User };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  /** État courant */
  private _user = signal<User | null>(null);

  /** Sélecteurs (computed) — à appeler comme des fonctions dans les templates/guards */
  readonly user = computed(() => this._user());
  readonly isLoggedIn = computed(() => !!this._user());
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly isVisitor = computed(() => this._user()?.role === 'visitor');

  constructor() {
    const raw = localStorage.getItem('auth');
    if (raw) {
      const { token, user } = JSON.parse(raw);
      if (!token || this.isJwtExpired(token)) {
        this.logout();
      } else {
        this._user.set(user);
      }
    }
  }

  /** ----- API ----- */

  login(email: string, password: string) {
    return this.http.post<LoginResp>(`${this.base}/auth/login`, { email, password });
  }

  async validateUser(email: string, password: string) {
    const resp = await firstValueFrom(this.login(email, password));
    return resp.user;
  }

  saveSession(token: string, user: User) {
    localStorage.setItem('auth', JSON.stringify({ token, user }));
    this._user.set(user);
  }

  logout() {
    localStorage.removeItem('auth');
    this._user.set(null);
    // Redirection immédiate vers la landing (ou login)
    window.location.href = '/';
  }

  getToken(): string | null {
    const raw = localStorage.getItem('auth');
    return raw ? JSON.parse(raw).token : null;
  }

  /** ----- Utils ----- */

  private isJwtExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expMs = payload.exp * 1000;
      return Date.now() > expMs;
    } catch {
      return true; // si le token est invalide, on considère expiré
    }
  }
}
