import 'chart.js/auto';
import { Component, OnInit, inject } from '@angular/core';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ApiService } from '../../services/api';

// (Optionnel) pipe safeUrl si tu intègres un iframe Power BI
// import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

@Component({
  selector: 'app-datastory',
  standalone: true,
  imports: [
    NgIf, NgFor, DecimalPipe,
    MatCardModule, MatChipsModule, MatIconModule, MatButtonModule,
    MatDividerModule, MatListModule, MatExpansionModule, MatStepperModule,
    MatTooltipModule,
    // SafeUrlPipe
  ],
  templateUrl: './datastory.html',
  styleUrls: ['./datastory.scss']
})
export class DataStory implements OnInit {
  private api = inject(ApiService);

  // KPIs dynamiques
  kpi: { revenue: number; units: number; avgPrice: number } | null = null;
  topModels: Array<{ make: string; model: string; units: number }> = [];
  trendLast5: Array<{ year: number; units: number; avg_price: number }> = [];
  loading = true;

  // ❶ Stepper (timeline interactive)
  steps = [
    { title: 'Ingestion', desc: 'CSV Kaggle → SQL Server. Contrôles de schéma & types.' },
    { title: 'Modèle', desc: 'Étoile : fact_sales + dim_year/model/region/color. Index/columnstore.' },
    { title: 'API', desc: 'NestJS + TypeORM : KPI pondérés, Top modèles, tendances.' },
    { title: 'Viz', desc: 'Angular (Material + Chart.js) et Power BI complémentaire.' },
    { title: 'Story', desc: 'Insights → Recos actionnables (prix, mix, régions).' }
  ];

  // ❷ Bandeau Avant/Après (exemples – adapte le contenu)
  beforeAfter = [
    { before: 'Reporting ad hoc, fichiers Excel isolés', after: 'Dashboard web & API versionnée' },
    { before: 'Agrégations lentes (full scan)', after: 'Index + columnstore → réponses instantanées' },
    { before: 'Prix moyen simple', after: 'Prix moyen pondéré (réaliste par volume)' },
    { before: 'Interprétation dispersée', after: 'Data Story structurée (résumé + actions)' },
  ];

  // ❸ Citations / insight cards (petites punchlines)
  quotes = [
    { icon: 'trending_up',  text: 'Les 3 meilleurs modèles concentrent une grande part du volume.' },
    { icon: 'price_check',  text: 'Une variation de 1k$ du prix moyen pèse significativement sur le revenu.' },
    { icon: 'public',       text: 'La dispersion régionale justifie un mix produit localisé.' },
  ];

  // ❹ CTA (liens de téléchargement – remplace par tes vrais chemins)
  ctas = [
    { icon: 'description', label: 'README', href: '/assets/README.pdf' },
    { icon: 'table_view',  label: 'Exports CSV', href: '/assets/exports.zip' },
    { icon: 'architecture',label: 'Schéma DB', href: '/assets/db-schema.png' },
    { icon: 'scatter_plot',label: 'Notebook EDA', href: '/assets/eda.ipynb' },
    { icon: 'insights',    label: 'Power BI (.pbix)', href: '/assets/auto-sales.pbix' },
  ];

  // (Optionnel) URL Power BI
  powerBiUrl = ''; // ex: 'https://app.powerbi.com/view?r=...'

  ngOnInit(): void { this.loadData(); }

  private loadData() {
    this.loading = true;

    this.api.getKpi({}).subscribe({
      next: (d: any) => {
        this.kpi = {
          revenue: Number(d.revenue ?? 0),
          units: Number(d.units ?? 0),
          avgPrice: Number(d.avgPrice ?? d.avg_price ?? 0),
        };
      }, error: () => {}
    });

    this.api.getTopModels({ top: 3 }).subscribe({
      next: (rows: any[]) => {
        this.topModels = rows.map(r => ({ make: r.make, model: r.model, units: +r.units || 0 }));
      }, error: () => {}
    });

    this.api.getTrend({}).subscribe({
      next: (rows: any[]) => {
        const sorted = [...rows].sort((a, b) => a.year - b.year);
        this.trendLast5 = sorted.slice(-5);
        this.loading = false;
      }, error: () => this.loading = false
    });
  }
}
