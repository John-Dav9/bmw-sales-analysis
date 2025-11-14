import 'chart.js/auto';

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

import { ApiService } from '../../services/api';

type Kpi = { revenue: number; units: number; avgPrice: number };

@Component({
  selector: 'app-usecases',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatSliderModule, MatIconModule, MatDividerModule,
    NgChartsModule
  ],
  templateUrl: './usecases.html',
  styleUrls: ['./usecases.scss']
})
export class Usecases implements OnInit {
  private api = inject(ApiService);

  /* =========================
   * 1) FILTRES / CONTEXTE
   * ========================= */
  years: number[] = [];
  regions: string[] = [];
  models: string[]  = [];

  year?: number;
  region?: string;
  model?: string;

  loading = false;

  ngOnInit(): void {
    this.loadFilters();
    this.loadBaseline();            // baseline globale
    this.loadMixBaseline();         // mix produit (top models)
    this.loadRegionMixBaseline();   // redistribution régionale
  }

  private loadFilters() {
    // Années à partir de la tendance
    this.api.getTrend({}).subscribe(rows => {
      this.years = Array.from(new Set(rows.map((r: any) => r.year))).sort((a: any, b: any) => a - b);
    });

    // Valeurs distinctes (région/modèle) depuis un listing (échantillon)
    this.api.getSales({ limit: 1000 }).subscribe(res => {
      const items = res.items || [];
      this.regions = Array.from(new Set(items.map((i: any) => i.region).filter(Boolean))).sort();
      this.models  = Array.from(new Set(items.map((i: any) => i.model).filter(Boolean))).sort();
    });
  }

  /* =========================
   * 2) BASELINE KPI
   * ========================= */
  baseline: Kpi | null = null;

  loadBaseline() {
    this.loading = true;
    this.api.getKpi({ year: this.year, region: this.region, model: this.model }).subscribe({
      next: (d: any) => {
        this.baseline = {
          revenue: Number(d.revenue ?? 0),
          units:   Number(d.units ?? 0),
          avgPrice: Number(d.avgPrice ?? d.avg_price ?? 0),
        };
        this.loading = false;
        this.runScenario();           // initialise le premier scénario
        this.loadMixBaseline();        
        this.loadRegionMixBaseline();  
      },
      error: () => { this.loading = false; }
    });
  }

  /* ================================================
   * 3) SCÉNARIO PRIX ↔ VOLUME (Élasticité constante)
   * ================================================ */
  priceDeltaPct = 0;    // ΔP en %
  elasticity   = -1.2;  // élasticité par défaut
  scenario: Kpi | null  = null;

  // Charts comparaison baseline vs scénario
  unitsChart:   ChartData<'bar'> = { labels: ['Units'],          datasets: [] };
  revenueChart: ChartData<'bar'> = { labels: ['Revenue (USD)'], datasets: [] };
  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales:  { y: { beginAtZero: true } }
  };

  runScenario() {
    if (!this.baseline) { this.scenario = null; return; }

    const u0 = this.baseline.units;
    const p0 = this.baseline.avgPrice;

    const priceFactor = 1 + (this.priceDeltaPct / 100);              // P1 = P0 * (1+ΔP)
    const volFactor   = 1 + (this.elasticity * (this.priceDeltaPct / 100)); // U1 = U0 * (1+e*ΔP)

    const p1 = Math.max(0, p0 * priceFactor);
    const u1 = Math.max(0, Math.round(u0 * volFactor));

    const rev0 = this.baseline.revenue || (u0 * p0);
    const rev1 = u1 * p1;

    this.scenario = { revenue: rev1, units: u1, avgPrice: p1 };

    this.unitsChart = {
      labels: ['Units'],
      datasets: [
        { label: 'Baseline', data: [u0] },
        { label: 'Scénario', data: [u1] }
      ]
    };
    this.revenueChart = {
      labels: ['Revenue (USD)'],
      datasets: [
        { label: 'Baseline', data: [rev0] },
        { label: 'Scénario', data: [rev1] }
      ]
    };
  }

  resetScenario() {
    this.priceDeltaPct = 0;
    this.elasticity    = -1.2;
    this.runScenario();
  }

  /* ================================================
   * 4) MIX PRODUIT (+ Promo sur modèle cible)
   * ================================================ */
  mixModels: Array<{ label: string; model: string; make: string; units: number; avg_price: number }> = [];
  mixTarget?: string;       // ex: "BMW 320i"
  mixTransferPct = 10;      // % d’unités transférées des autres → cible
  promoPct       = 0;       // remise en % sur le prix moyen de la cible

  mixBaselineRevenue = 0;
  mixScenarioRevenue = 0;

  mixChart:   ChartData<'bar'> = { labels: [], datasets: [] };
  mixOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales:  { y: { beginAtZero: true } }
  };

  // Top 5 modèles pour les filtres actuels
  loadMixBaseline() {
    this.api.getTopModels({ top: 5, year: this.year, region: this.region }).subscribe({
      next: (rows: any[]) => {
        this.mixModels = rows.map(r => ({
          label: `${r.make} ${r.model}`,
          make: r.make,
          model: r.model,
          units: Number(r.units || 0),
          avg_price: Number(r.avg_price || 0),
        }));
        this.mixBaselineRevenue = this.mixModels.reduce((acc, m) => acc + m.units * m.avg_price, 0);
        this.mixTarget = this.mixModels[0]?.label;
        this.runMixScenario();
      },
      error: (e) => { console.error('mix baseline error', e); this.mixModels = []; }
    });
  }

  runMixScenario() {
    if (!this.mixModels.length || !this.mixTarget) {
      this.mixChart = { labels: [], datasets: [] };
      this.mixScenarioRevenue = 0;
      return;
    }

    const totalUnits = this.mixModels.reduce((acc, m) => acc + m.units, 0);
    if (totalUnits === 0) {
      this.mixChart = { labels: [], datasets: [] };
      this.mixScenarioRevenue = 0;
      return;
    }

    const targetIdx = this.mixModels.findIndex(m => m.label === this.mixTarget);
    if (targetIdx < 0) return;

    const transferUnits    = Math.round(totalUnits * (this.mixTransferPct / 100));
    const othersTotalUnits = this.mixModels
      .filter((_, i) => i !== targetIdx)
      .reduce((acc, m) => acc + m.units, 0);

    // clone des units pour le scénario
    const scenarioUnits = this.mixModels.map(m => m.units);

    if (transferUnits > 0 && othersTotalUnits > 0) {
      // retirer aux autres proportionnellement
      this.mixModels.forEach((m, i) => {
        if (i === targetIdx) return;
        const take = Math.round(transferUnits * (m.units / othersTotalUnits));
        scenarioUnits[i] = Math.max(0, m.units - take);
      });
      // donner à la cible tout en conservant le total
      const sumOthers = scenarioUnits.reduce((a, b, i) => i === targetIdx ? a : a + b, 0);
      scenarioUnits[targetIdx] = totalUnits - sumOthers;
    }

    // Promo sur le modèle cible
    const p0Target   = this.mixModels[targetIdx].avg_price;
    const promoFactor = 1 + (this.promoPct / 100);   // ex: -5% => 0.95
    const p1Target   = Math.max(0, p0Target * promoFactor);

    // Revenus baseline vs scénario
    const baselineRev = this.mixModels.reduce((acc, m) => acc + m.units * m.avg_price, 0);
    const scenarioRev = this.mixModels.reduce((acc, m, i) => {
      const price = (i === targetIdx) ? p1Target : m.avg_price;
      return acc + scenarioUnits[i] * price;
    }, 0);

    this.mixBaselineRevenue = baselineRev;
    this.mixScenarioRevenue = scenarioRev;

    this.mixChart = {
      labels: this.mixModels.map(m => m.label),
      datasets: [
        { label: 'Units Baseline', data: this.mixModels.map(m => m.units) as number[] },
        { label: 'Units Scénario', data: scenarioUnits as number[] }
      ]
    };
  }

  /* ================================================
   * 5) RÉALLOCATION RÉGIONALE
   * ================================================ */
  regionMix: Array<{ region: string; units: number; avg_price: number }> = [];
  regionSource?: string;
  regionTarget?: string;
  regionTransferPct = 10;

  regionBaselineRevenue = 0;
  regionScenarioRevenue = 0;

  regionChart: ChartData<'bar'> = { labels: [], datasets: [] };
  regionOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales:  { y: { beginAtZero: true } }
  };

  // Agrège {region, units, avg_price pondéré} depuis /sales/list
  loadRegionMixBaseline() {
    this.api.getSales({ limit: 5000, year: this.year, model: this.model, region: undefined }).subscribe({
      next: (res: any) => {
        const rows = res.items || [];
        const agg: Record<string, { units: number; rev: number }> = {};

        for (const r of rows) {
          const region = r.region || 'Unknown';
          const units  = Number(r.sales_volume || 0);
          const price  = Number(r.price_usd || 0);
          if (!agg[region]) agg[region] = { units: 0, rev: 0 };
          agg[region].units += units;
          agg[region].rev   += units * price;   // revenu pondéré
        }

        this.regionMix = Object.entries(agg).map(([region, v]) => ({
          region,
          units: v.units,
          avg_price: v.units ? v.rev / v.units : 0
        }));

        this.regionBaselineRevenue = this.regionMix.reduce((a, r) => a + r.units * r.avg_price, 0);

        // défaut: cible = plus grosse région, source = plus petite
        const sorted = [...this.regionMix].sort((a, b) => b.units - a.units);
        this.regionTarget = sorted[0]?.region;
        this.regionSource = sorted[sorted.length - 1]?.region;

        this.runRegionMixScenario();
      },
      error: (e: any) => {
        console.error('region mix baseline error', e);
        this.regionMix = [];
        this.regionBaselineRevenue = 0;
        this.regionScenarioRevenue = 0;
        this.regionChart = { labels: [], datasets: [] };
      }
    });
  }

  // Transfère X% des unités de la source vers la cible (prix moyens constants par région)
  runRegionMixScenario() {
    if (!this.regionMix.length || !this.regionSource || !this.regionTarget || this.regionSource === this.regionTarget) {
      this.regionScenarioRevenue = this.regionBaselineRevenue;
      this.regionChart = { labels: [], datasets: [] };
      return;
    }

    const idxS = this.regionMix.findIndex(r => r.region === this.regionSource);
    const idxT = this.regionMix.findIndex(r => r.region === this.regionTarget);
    if (idxS < 0 || idxT < 0) return;

    const baseUnits  = this.regionMix.map(r => r.units);
    const basePrices = this.regionMix.map(r => r.avg_price);

    const transfer = Math.round(baseUnits[idxS] * (this.regionTransferPct / 100));
    const scenarioUnits = [...baseUnits];
    scenarioUnits[idxS] = Math.max(0, baseUnits[idxS] - transfer);
    scenarioUnits[idxT] = baseUnits[idxT] + transfer;

    const baselineRev = baseUnits .reduce((a, u, i) => a + u * basePrices[i], 0);
    const scenarioRev = scenarioUnits.reduce((a, u, i) => a + u * basePrices[i], 0);

    this.regionBaselineRevenue = baselineRev;
    this.regionScenarioRevenue = scenarioRev;

    this.regionChart = {
      labels: this.regionMix.map(r => r.region),
      datasets: [
        { label: 'Units Baseline', data: baseUnits },
        { label: 'Units Scénario', data: scenarioUnits }
      ]
    };
  }
}
