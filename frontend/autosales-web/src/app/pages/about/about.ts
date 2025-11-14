import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatIconModule, MatChipsModule,
    MatButtonModule, MatDividerModule, MatListModule
  ],
  templateUrl: './about.html',
  styleUrls: ['./about.scss']
})
export class About {
  // 🔗 Liens (remplace par tes vrais liens)
  links = {
    email: 'mailto:you@example.com',
    github: 'https://github.com/ton-github',
    linkedin: 'https://www.linkedin.com/in/ton-linkedin',
    resume: 'assets/docs/CV.pdf',           // place le fichier dans src/assets/docs/CV.pdf
    projectRepo: 'https://github.com/ton-github/auto-sales-analytics'
  };

  // 🧰 Compétences phares (chips)
  skills = [
    'Angular', 'NestJS', 'TypeORM', 'SQL Server',
    'Power BI', 'Chart.js', 'ETL (SQL/Python)', 'Modèle en étoile',
    'Tests & Perf', 'GitHub Actions'
  ];

  // 🗂️ Sections de valeur
  value = [
    { icon: 'analytics', title: 'Data-driven',
      text: 'Je conçois des API et dashboards qui répondent à des questions business concrètes.' },
    { icon: 'bolt', title: 'Impact rapide',
      text: 'Livrables clairs, itérations courtes, et focus sur l’expérience utilisateur.' },
    { icon: 'verified', title: 'Qualité & fiabilité',
      text: 'Schéma propre, contrôles de qualité, agrégations pondérées, perf mesurée.' }
  ];

  // 🕒 Timeline (mini CV)
  timeline = [
    { period: '2024–2025', role: 'Data/Full-stack (perso & freelance)',
      items: ['Angular + NestJS', 'SQL Server / Power BI', 'CI/CD GitHub'] },
    { period: '2022–2024', role: 'Data Analyst',
      items: ['Reporting Power BI', 'Automatisation ETL', 'Data quality'] },
    { period: 'Avant', role: 'Études / Projets',
      items: ['Bases solides en SQL & Web', 'Projets Kaggle', 'Portfolio en progression'] },
  ];
}
