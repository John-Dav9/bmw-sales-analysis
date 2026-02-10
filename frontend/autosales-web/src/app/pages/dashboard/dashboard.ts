import 'chart.js/auto'; // enregistre tous les éléments Chart.js
import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DecimalPipe, NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ApiService } from '../../services/api';
import { NgChartsModule } from 'ng2-charts';
import { barDataset, lineDataset, doughnutDataset, CHART_GRID, CHART_TICK, paletteColor, rgba } from '../../services/chart-theme';

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
    datasets: [lineDataset('Units', [], 0)]
  };
  trendOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: CHART_TICK } } },
    scales: {
      x: { ticks: { color: CHART_TICK }, grid: { color: CHART_GRID } },
      y1: { position: 'left', ticks: { color: CHART_TICK }, grid: { color: CHART_GRID } },
      y2: { position: 'right', ticks: { color: CHART_TICK }, grid: { drawOnChartArea: false } }
    }
  };

  // --- DOUGHNUTS (Top modèles & répartition région) ---
  private readonly modelPalette = ['#1A237E', '#8BC34A', '#0EA5E9', '#F59E0B', '#EF4444', '#8B5CF6'];
  private readonly channelPalette = ['#10B981', '#22C55E', '#38BDF8', '#F97316', '#E11D48', '#A855F7'];
  private readonly regionsPalette = ['#F97316', '#EF4444', '#EC4899', '#8B5CF6', '#22C55E', '#0EA5E9', '#F59E0B', '#14B8A6'];

  modelData: ChartData<'doughnut'> = { labels: [], datasets: [doughnutDataset([])] };
  channelData: ChartData<'doughnut'> = { labels: [], datasets: [doughnutDataset([])] };
  modelOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: CHART_TICK } } }
  };
  channelOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: CHART_TICK } } }
  };

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
        { ...lineDataset('Units', series.map(s => +s.units || 0), 0), yAxisID: 'y1' },
        { ...lineDataset('Avg Price (USD)', series.map(s => +s.avg_price || 0), 1), yAxisID: 'y2' }
      ]
    };
  });
}


  // --- Donut Top modèles (via /sales/insights/top-models) ---
  fetchModelSplit() {
    this.api.getTopModels({ top: 6 }).subscribe({
      next: (rows: any[]) => {
        const labels = rows.map(r => `${r.make} ${r.model}`);
        const data = rows.map(r => Number(r.units || 0));
        this.modelData = {
          labels,
          datasets: [{
            data,
            backgroundColor: data.map((_, i) => this.modelPalette[i % this.modelPalette.length]),
            borderColor: '#ffffff',
            borderWidth: 1
          }]
        };
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
        this.channelData = {
          labels,
          datasets: [{
            data,
            backgroundColor: data.map((_, i) => this.channelPalette[i % this.channelPalette.length]),
            borderColor: '#ffffff',
            borderWidth: 1
          }]
        };
      },
      error: (err) => console.error('channel split error', err)
    });
  }

  regionsData: ChartData<'bar'> = { labels: [], datasets: [barDataset('Units', [], 0)] };
  regionsOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: CHART_TICK } } },
    scales: {
      x: { ticks: { color: CHART_TICK }, grid: { color: CHART_GRID } },
      y: { ticks: { color: CHART_TICK }, grid: { color: CHART_GRID }, beginAtZero: true }
    }
  };

  fetchTopRegions() {
    this.api.getTopRegions({ top: 8 }).subscribe(rows => {
        const colors = rows.map((_, i) => this.regionsPalette[i % this.regionsPalette.length]);
        this.regionsData = {
          labels: rows.map(r => r.region || 'Unknown'),
          datasets: [{
            label: 'Units',
            data: rows.map(r => +r.units || 0),
            backgroundColor: colors.map(c => rgba(c, 0.75)),
            borderColor: colors,
            borderWidth: 1,
            borderRadius: 8,
            borderSkipped: false,
          }]
        };
    });
  }

  fuelData: ChartData<'bar'> = { labels: [], datasets: [] };
  fuelOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: CHART_TICK }, grid: { color: CHART_GRID }, stacked: true },
      y: { ticks: { color: CHART_TICK }, grid: { color: CHART_GRID }, stacked: true, beginAtZero: true }
    },
    plugins: { legend: { position: 'bottom', labels: { color: CHART_TICK } } }
  };

  fetchFuelByYear() {
    this.api.getFuelByYear({}).subscribe(rows => {
      const years = Array.from(new Set(rows.map(r => r.year))).sort();
      const fuels = Array.from(new Set(rows.map(r => r.fuel || 'Unknown')));
      const series = fuels.map((f, i) => ({
        ...barDataset(f, years.map(y => {
          const row = rows.find(r => r.year === y && (r.fuel || 'Unknown') === f);
          return row ? +row.units : 0;
        }), i),
        stack: 'fuel'
      }));
      this.fuelData = { labels: years.map(String), datasets: series as any };
    });
  }

  scatterData: ChartData<'scatter'> = { datasets: [{ label: 'Avg Price', data: [] as any[] }] };
  scatterOptions: ChartConfiguration<'scatter'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: CHART_TICK } } },
    scales: {
      x: { ticks: { color: CHART_TICK }, grid: { color: CHART_GRID } },
      y: { ticks: { color: CHART_TICK }, grid: { color: CHART_GRID } }
    }
  };

  fetchPriceVsEngine() {
    this.api.getPriceVsEngine({}).subscribe(rows => {
      const c = paletteColor(2);
      this.scatterData = {
        datasets: [{
          label: 'Avg Price',
          data: rows.map(r => ({ x: +r.engine, y: +r.avg_price })),
          backgroundColor: rgba(c, 0.6),
          borderColor: c,
          pointRadius: 4
        }]
      };
    });
  }

}
