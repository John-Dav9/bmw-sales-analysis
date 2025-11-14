import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoaderService } from './loader.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  styles: [`
    .loader-bar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
    }
  `],
  template: `
    <mat-progress-bar *ngIf="loading()" class="loader-bar" mode="indeterminate"></mat-progress-bar>
  `
})
export class GlobalLoaderComponent implements OnInit, OnDestroy {
  private sub?: Subscription;
  private _loading = signal(false);
  loading = computed(() => this._loading());

  constructor(private loader: LoaderService) {}
  ngOnInit() { this.sub = this.loader.loading$.subscribe(v => this._loading.set(v)); }
  ngOnDestroy() { this.sub?.unsubscribe(); }
}
