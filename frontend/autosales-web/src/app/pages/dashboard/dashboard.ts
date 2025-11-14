import 'chart.js/auto'; // enregistre tous les éléments Chart.js
import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DecimalPipe, NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ApiService } from '../../services/api';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, NgIf, MatProgressSpinnerModule, NgChartsModule, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  private api = inject(ApiService);

  loading = false;
  kpi: { revenue: number; units: number; avgPrice: number } | null = null;

  // --- LINE (Trend) ---
  trendData: ChartData<'line'> = {
    labels: [],
    datasets: [{ label: 'Units', data: [], tension: 0.25, fill: false }]
  };
  trendOptions: ChartConfiguration<'line'>['options'] = { responsive: true, maintainAspectRatio: false };

  // --- DOUGHNUTS (Top modèles & répartition région) ---
  modelData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] };
  channelData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] };
  modelOptions: ChartConfiguration<'doughnut'>['options'] = { responsive: true, maintainAspectRatio: false };
  channelOptions: ChartConfiguration<'doughnut'>['options'] = { responsive: true, maintainAspectRatio: false };

  ngOnInit(): void {
    this.fetchKpi();
    this.fetchTrend();
    this.fetchModelSplit();    // <-- ajoute l’alimentation des donuts
    this.fetchChannelSplit(); 

    // nouveaux graphiques
    this.fetchTopRegions();
    this.fetchFuelByYear();
    this.fetchPriceVsEngine(); // <-- idem
  }

  // --- KPI ---
  fetchKpi() {
    this.loading = true;
    this.api.getKpi({}).subscribe({
      next: (d: any) => {
        this.kpi = {
          revenue: Number(d.revenue ?? 0),
          units: Number(d.units ?? 0),
          // l’API peut renvoyer avgPrice OU avg_price selon ton service → on couvre les 2
          avgPrice: Number(d.avgPrice ?? d.avg_price ?? 0),
        };
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // --- Trend ---
fetchTrend() {
  this.api.getTrend({}).subscribe((series: any[]) => {
    this.trendData = {
      labels: series.map(s => String(s.year)),
      datasets: [
        { label: 'Units', data: series.map(s => +s.units || 0), yAxisID: 'y1', tension: 0.25, fill: false },
        { label: 'Avg Price (USD)', data: series.map(s => +s.avg_price || 0), yAxisID: 'y2' }
      ]
    };
    this.trendOptions = {
      responsive: true, maintainAspectRatio: false,
      scales: { y1: { position: 'left' }, y2: { position: 'right' } }
    };
  });
}


  // --- Donut Top modèles (via /sales/insights/top-models) ---
  fetchModelSplit() {
    this.api.getTopModels({ top: 6 }).subscribe({
      next: (rows: any[]) => {
        const labels = rows.map(r => `${r.make} ${r.model}`);
        const data = rows.map(r => Number(r.units || 0));
        this.modelData = { labels, datasets: [{ data }] };
      },
      error: (err) => console.error('model split error', err)
    });
  }

  // --- Donut par “canal” (on agrège par région en attendant un vrai champ channel) ---
  fetchChannelSplit() {
    // on prend un échantillon raisonnable (augmente si besoin)
    this.api.getSales({ limit: 2000 }).subscribe({
      next: (res: { items: any[]; total: number }) => {
        const agg: Record<string, number> = {};
        for (const it of res.items) {
          const key = it.region || 'Inconnu';
          agg[key] = (agg[key] || 0) + (it.sales_volume ?? 0);
        }
        const labels = Object.keys(agg);
        const data = Object.values(agg) as number[];
        this.channelData = { labels, datasets: [{ data }] };
      },
      error: (err) => console.error('channel split error', err)
    });
  }

  regionsData: ChartData<'bar'> = { labels: [], datasets: [{ label: 'Units', data: [] }] };
  regionsOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, maintainAspectRatio: false };

  fetchTopRegions() {
    this.api.getTopRegions({ top: 8 }).subscribe(rows => {
      this.regionsData = {
        labels: rows.map(r => r.region || 'Unknown'),
        datasets: [{ label: 'Units', data: rows.map(r => +r.units || 0) }]
      };
    });
  }

  fuelData: ChartData<'bar'> = { labels: [], datasets: [] };
fuelOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, maintainAspectRatio: false, scales: { x: {}, y: { stacked: true } }, plugins: { legend: { position: 'bottom' } } };

  fetchFuelByYear() {
    this.api.getFuelByYear({}).subscribe(rows => {
      const years = Array.from(new Set(rows.map(r => r.year))).sort();
      const fuels = Array.from(new Set(rows.map(r => r.fuel || 'Unknown')));
      const series = fuels.map(f => ({
        label: f,
        data: years.map(y => {
          const row = rows.find(r => r.year === y && (r.fuel || 'Unknown') === f);
          return row ? +row.units : 0;
        })
      }));
      this.fuelData = { labels: years.map(String), datasets: series as any };
    });
  }

  scatterData: ChartData<'scatter'> = { datasets: [{ label: 'Avg Price', data: [] as any[] }] };
scatterOptions: ChartConfiguration<'scatter'>['options'] = { responsive: true, maintainAspectRatio: false };

  fetchPriceVsEngine() {
    this.api.getPriceVsEngine({}).subscribe(rows => {
      this.scatterData = {
        datasets: [{
          label: 'Avg Price',
          data: rows.map(r => ({ x: +r.engine, y: +r.avg_price }))
        }]
      };
    });
  }

}
