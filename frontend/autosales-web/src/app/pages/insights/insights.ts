import 'chart.js/auto'; // enregistre les éléments Chart.js
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';

import { ChartConfiguration, ChartData } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { ApiService } from '../../services/api';
import { barDataset, CHART_GRID, CHART_TICK } from '../../services/chart-theme';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    NgChartsModule
  ],
  styleUrls: ['./insights.scss'],
  templateUrl: './insights.html' // ✅ au lieu de template: './insights.html'
})
export class Insights implements OnInit {
  private api = inject(ApiService);

  year?: number;
  region?: string;

  loading = false;

  data: ChartData<'bar'> = {
    labels: [],
    datasets: [barDataset('Units', [], 1)] // green dominant for Insights
  };
  options: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: CHART_TICK } } },
    scales: {
      x: { ticks: { color: CHART_TICK }, grid: { color: CHART_GRID } },
      y: { ticks: { color: CHART_TICK }, grid: { color: CHART_GRID }, beginAtZero: true }
    }
  };

  ngOnInit(): void {
    this.loadTop();
  }

  loadTop() {
    this.loading = true;
    this.api.getTopModels({ top: 10, year: this.year, region: this.region }).subscribe({
      next: (rows: any[]) => {
        const labels = rows.map(r => `${r.make} ${r.model}`);
        const units = rows.map(r => Number(r.units || 0));
        this.data = { labels, datasets: [barDataset('Units', units, 1)] };
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }
}
