import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

const MAX_IDLE_MS = 30 * 60 * 1000; // 30 minutes
const LAST_ACTIVITY_KEY = 'lastActivityAt';

@Injectable({ providedIn: 'root' })
export class InactivityService {
  private auth = inject(AuthService);
  private router = inject(Router);
  private timer: any = null;

  init() {
    // Démarre au lancement de l’app
    this.installActivityListeners();
    this.restoreOrSeedActivity();
    this.resetTimer();

    // Sync multi-onglets
    window.addEventListener('storage', (e) => {
      if (e.key === LAST_ACTIVITY_KEY) {
        this.resetTimer(false); // ne réécrit pas, on suit l’onglet actif
      }
    });
  }

  private installActivityListeners() {
    const bump = () => this.bumpActivity();
    ['click','mousemove','keydown','scroll','touchstart','visibilitychange'].forEach(evt => {
      window.addEventListener(evt, bump, { passive: true });
    });
  }

  private restoreOrSeedActivity() {
    if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
      this.bumpActivity();
    }
  }

  private bumpActivity() {
    // si pas connecté, inutile d’écrire
    if (!this.auth.isLoggedIn()) return;
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    this.resetTimer();
  }

  private resetTimer(write = true) {
    clearTimeout(this.timer);
    if (write && this.auth.isLoggedIn()) {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    }
    this.timer = setTimeout(() => this.handleIdleTimeout(), MAX_IDLE_MS);
  }

  private handleIdleTimeout() {
    // Double sécurité : si token expiré côté back, l’interceptor 401 gérera aussi
    this.auth.logout(); // redirige vers "/"
  }
}
