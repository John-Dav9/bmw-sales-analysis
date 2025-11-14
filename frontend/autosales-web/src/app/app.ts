// src/app/app.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/header/header';
import { Footer } from './shared/footer/footer';
import { GlobalLoaderComponent } from './core/loader/global-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,                         // ✅ important
  imports: [RouterOutlet, Header, Footer, GlobalLoaderComponent],
  template: `
    <div class="app-shell">
      <app-header></app-header>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>

    <!-- Loader global (overlay) -->
    <app-global-loader></app-global-loader>
  `,
  styles: [`
    .app-shell { min-height: 100dvh; display: grid; grid-template-rows: auto 1fr auto; }
    .content   { background: var(--color-bg, #F5F7FA); }
  `]
})
export class App {}
