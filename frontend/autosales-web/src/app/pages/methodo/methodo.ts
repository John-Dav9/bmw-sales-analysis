import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';


interface DocItem {
  label: string;
  path: string;     // chemin relatif depuis /src/assets
  available: boolean;
  sizeHint?: string; // optionnel (ex: "~2 MB")
}

@Component({
  selector: 'app-methodo',
  standalone: true,
  imports: [
    NgIf, NgFor, MatProgressBarModule,
    MatCardModule, MatIconModule, MatChipsModule,
    MatExpansionModule, MatDividerModule, MatListModule,
    MatStepperModule, MatButtonModule
  ],
  templateUrl: './methodo.html',
  styleUrls: ['./methodo.scss']
})
export class Methodo {
    stack = [
    { icon: 'database', label: 'SQL Server (DB & index/columnstore)' },
    { icon: 'tune',     label: 'ETL Python/SQL (chargement CSV Kaggle)' },
    { icon: 'api',      label: 'NestJS + TypeORM (API REST)' },
    { icon: 'web',      label: 'Angular + Material + Chart.js (Front)' },
    { icon: 'insights', label: 'Power BI (rapport annexe)' },
    { icon: 'cloud',    label: 'GitHub (code & pages)' }
  ];

  // étapes du pipeline (affichées dans le Stepper)
  steps = [
    { title: 'Ingestion',  desc: 'Chargement des CSV Kaggle → SQL Server (types, normalisation, clés techniques).' },
    { title: 'Modélisation', desc: 'Schéma en étoile : fact_sales + dimensions year, model, region, color.' },
    { title: 'Qualité',    desc: 'Contrôles: doublons, nuls, bornes, distributions; logs & rapports.' },
    { title: 'API',        desc: 'Endpoints KPI/insights, agrégations pondérées, pagination, filtres, CORS.' },
    { title: 'Viz',        desc: 'Dashboard Angular + pages (Insights, Data Story, Méthodo, etc.).' }
  ];

  // contrôles de qualité (affichés dans l’Accordion)
  dq = [
    { title: 'Schéma & Types', items: [
      'Casting numérique: price_usd DECIMAL, sales_volume INT, engine_size_l DECIMAL',
      'Dates/années cohérentes: year entre 2010 et 2024'
    ]},
    { title: 'Unicité & Doublons', items: [
      'fact_sales.sales_key unique',
      'Vérif des doublons sur (year_key, model_key, region_key, color_key)'
    ]},
    { title: 'Valeurs manquantes', items: [
      'Fuel/Transmission/Color → valeurs “Unknown” si null',
      'Suppression des lignes sans prix et sans volume'
    ]},
    { title: 'Bornes & Outliers', items: [
      'price_usd ∈ [500, 300000], engine_size_l ∈ [0.6, 8.0]',
      'tax/mpg dans des plages plausibles pour éliminer les aberrations'
    ]},
    { title: 'Stats & Distributions', items: [
      'Médianes/écarts-type par modèle et par région',
      'Taux de complétude > 98% sur les colonnes clés'
    ]},
  ];

  // livrables/artefacts
  deliverables = [
    { icon: 'description', label: 'README du projet' },
    { icon: 'table_view',  label: 'Exports CSV/Parquet nettoyés' },
    { icon: 'schema',      label: 'Schémas DB (DDL + diagrammes)' },
    { icon: 'code',        label: 'Notebooks EDA/ETL' },
    { icon: 'api',         label: 'Collection API (endpoints)' },
    { icon: 'insights',    label: 'Rapport Power BI (.pbix)' },
  ];

  // 🔽 Liste des documents attendus (chemins à ajuster à ta convenance)
  docs: DocItem[] = [
    { label: 'README (PDF)',            path: 'assets/docs/README.pdf',          available: false },
    { label: 'DDL SQL Server (SQL)',    path: 'assets/docs/ddl_sqlserver.sql',   available: false },
    { label: 'Notebook EDA (ipynb)',    path: 'assets/docs/eda.ipynb',           available: false },
    { label: 'Notebook ETL (ipynb)',    path: 'assets/docs/etl.ipynb',           available: false },
    { label: 'Schéma DB (PNG)',         path: 'assets/docs/db-schema.png',       available: false },
    { label: 'Exports nettoyés (ZIP)',  path: 'assets/docs/exports_clean.zip',   available: false },
    { label: 'Power BI (.pbix)',        path: 'assets/docs/auto-sales.pbix',     available: false },
  ];

  loadingDocs = true;

  ngOnInit(): void {
    // vérifie la présence des fichiers (même origine)
    this.checkAvailability();
  }

  async checkAvailability() {
    // HEAD sur chaque ressource ; si 200 => disponible
    const checks = this.docs.map(async (d) => {
      try {
        const res = await fetch(d.path, { method: 'HEAD', cache: 'no-cache' });
        d.available = res.ok;
      } catch {
        d.available = false;
      }
    });
    await Promise.all(checks);
    this.loadingDocs = false;
  }

  openOrDownload(doc: DocItem) {
    if (!doc.available) return;
    // comportement simple : ouvrir dans un nouvel onglet (ou télécharger si le navigateur le décide)
    window.open(doc.path, '_blank');
  }

}
