# 🚀 Guide de Déploiement Firebase - BMW Sales Analysis

## 📋 Vue d'ensemble

Ce guide explique comment déployer le projet complet sur Firebase et services complémentaires.

### Architecture de déploiement recommandée

```
┌─────────────────────────────────────────────────────────────┐
│                     UTILISATEURS                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────┐            ┌────────────────┐
│   FIREBASE    │            │  RENDER.COM    │
│   HOSTING     │  API Calls │   (Backend)    │
│  (Frontend)   ├───────────>│   NestJS       │
│   Angular     │            │   + SQLite     │
└───────────────┘            └────────────────┘
```

---

## ✅ SOLUTION RECOMMANDÉE : Déploiement Hybride

### Frontend → Firebase Hosting (GRATUIT)
### Backend → Render.com (GRATUIT avec limitations)

---

## 📦 PARTIE 1 : Déploiement Frontend sur Firebase

### Étape 1.1 : Installation Firebase CLI

```powershell
# Installer Firebase CLI globalement
npm install -g firebase-tools

# Vérifier l'installation
firebase --version

# Se connecter à Firebase
firebase login
```

### Étape 1.2 : Initialiser Firebase dans le projet

```powershell
# À la racine du projet
cd C:\Users\tchom\Desktop\bmw-sales-analysis

# Initialiser Firebase (si pas déjà fait)
firebase init hosting

# Répondre aux questions :
# ? What do you want to use as your public directory? docs
# ? Configure as a single-page app (rewrite all urls to /index.html)? Yes
# ? Set up automatic builds and deploys with GitHub? No (ou Yes si vous voulez)
```

### Étape 1.3 : Configurer le projet Firebase

1. **Modifier `.firebaserc`** avec votre ID de projet Firebase :
```json
{
  "projects": {
    "default": "bmw-sales-analysis-xxxxx"
  }
}
```

2. **Récupérer votre ID de projet** :
   - Aller sur https://console.firebase.google.com/
   - Sélectionner votre projet
   - Paramètres du projet → ID du projet

### Étape 1.4 : Build du frontend pour production

```powershell
cd frontend/autosales-web

# Installer les dépendances si pas déjà fait
npm install

# Build de production
ng build --configuration production

# Les fichiers seront dans frontend/autosales-web/dist/autosales-web/browser/
```

### Étape 1.5 : Copier les fichiers dans le dossier docs/

```powershell
# Option 1 : Copier manuellement
# Copier tout le contenu de frontend/autosales-web/dist/autosales-web/browser/* vers docs/

# Option 2 : Script PowerShell
$source = "frontend\autosales-web\dist\autosales-web\browser\*"
$destination = "docs\"
Copy-Item -Path $source -Destination $destination -Recurse -Force
```

### Étape 1.6 : Déployer sur Firebase

```powershell
# Retour à la racine du projet
cd C:\Users\tchom\Desktop\bmw-sales-analysis

# Déployer
firebase deploy --only hosting

# Résultat : Votre site sera accessible sur :
# https://votre-projet.web.app
# ou
# https://votre-projet.firebaseapp.com
```

---

## 🖥️ PARTIE 2 : Déploiement Backend sur Render.com

### Étape 2.1 : Créer un compte Render

1. Aller sur https://render.com/
2. S'inscrire avec GitHub (recommandé)
3. Connecter votre dépôt GitHub

### Étape 2.2 : Préparer le backend pour Render

#### A. Créer un fichier `render.yaml` à la racine du projet

```yaml
services:
  - type: web
    name: bmw-sales-api
    env: node
    region: frankfurt  # ou oregon, singapore
    buildCommand: cd backend/bmw-project && npm install && npm run build
    startCommand: cd backend/bmw-project && npm run start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: DB_NAME
        value: bmw-sales.db
      - key: PORT
        value: 10000
    healthCheckPath: /
```

#### B. Vérifier le package.json du backend

Fichier `backend/bmw-project/package.json` doit avoir :
```json
{
  "scripts": {
    "start:prod": "node dist/main",
    "build": "nest build"
  }
}
```

### Étape 2.3 : Déployer sur Render

1. **Dashboard Render** → New + → Web Service
2. **Connecter le dépôt GitHub**
3. **Configuration** :
   - Name: `bmw-sales-api`
   - Environment: `Node`
   - Build Command: `cd backend/bmw-project && npm install && npm run build`
   - Start Command: `cd backend/bmw-project && npm run start:prod`
   - Plan: `Free` (gratuit)

4. **Variables d'environnement** :
   ```
   NODE_ENV=production
   DB_NAME=bmw-sales.db
   PORT=10000
   JWT_SECRET=votre-secret-securise-ici
   ```

5. **Déployer** → Attendre 5-10 minutes

6. **URL générée** : `https://bmw-sales-api.onrender.com`

### Étape 2.4 : Mettre à jour le frontend avec l'URL du backend

Modifier `frontend/autosales-web/src/environments/environment.ts` :

```typescript
export const environment = {
  production: true,
  apiBase: 'https://bmw-sales-api.onrender.com'  // ← URL Render
};
```

Puis rebuild et redéployer le frontend :
```powershell
cd frontend/autosales-web
ng build --configuration production
# Copier vers docs/
firebase deploy --only hosting
```

---

## ⚙️ PARTIE 3 : Configuration CORS

Le backend doit autoriser Firebase Hosting. Vérifier dans `backend/bmw-project/src/main.ts` :

```typescript
app.enableCors({
  origin: [
    'http://localhost:4200',
    'https://votre-projet.web.app',              // ← Ajouter
    'https://votre-projet.firebaseapp.com'       // ← Ajouter
  ],
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Accept, Authorization'
});
```

---

## 🎯 ALTERNATIVES AU BACKEND

Si Render.com ne convient pas, alternatives gratuites :

### Option A : Railway.app
- 500h/mois gratuites
- Support SQLite excellent
- `railway up` pour déployer
- URL : `https://votre-app.railway.app`

### Option B : Fly.io
- Support conteneurs Docker
- SQLite avec volumes persistants
- Commande : `fly launch`

### Option C : Vercel (limité)
- Bon pour frontend
- Backend possible mais avec limitations SQLite

### Option D : Firebase Cloud Functions (COMPLEXE)
- Nécessite migration vers Firestore
- Refonte complète du backend
- Non recommandé pour ce projet

---

## 📊 Tableau comparatif

| Service          | Frontend | Backend NestJS | SQLite | Coût   | Difficulté |
|------------------|----------|----------------|--------|--------|------------|
| Firebase Hosting | ✅       | ❌             | ❌     | Gratuit| Facile     |
| Render.com       | ❌       | ✅             | ✅     | Gratuit| Facile     |
| Railway.app      | ❌       | ✅             | ✅     | Gratuit| Facile     |
| Fly.io           | ✅       | ✅             | ✅     | Gratuit| Moyen      |
| Firebase Full    | ✅       | ⚠️             | ❌     | Payant | Difficile  |

---

## 🔐 SÉCURITÉ

### Variables d'environnement sensibles

Ne jamais commiter :
- JWT_SECRET
- Mots de passe base de données
- API keys Firebase

Utiliser les variables d'environnement du service de déploiement.

### Secrets Firebase (si besoin)

```powershell
# Stocker des secrets
firebase functions:secrets:set JWT_SECRET

# Utiliser dans le code
const secret = process.env.JWT_SECRET;
```

---

## 🚀 Scripts de déploiement automatique

Créer `deploy.ps1` à la racine :

```powershell
# Script de déploiement complet

Write-Host "🔨 Build du frontend..." -ForegroundColor Cyan
cd frontend/autosales-web
npm run build

Write-Host "📦 Copie vers docs/..." -ForegroundColor Cyan
cd ../..
Copy-Item -Path "frontend\autosales-web\dist\autosales-web\browser\*" -Destination "docs\" -Recurse -Force

Write-Host "🚀 Déploiement Firebase..." -ForegroundColor Cyan
firebase deploy --only hosting

Write-Host "✅ Déploiement terminé !" -ForegroundColor Green
Write-Host "🌐 Site accessible sur : https://votre-projet.web.app" -ForegroundColor Yellow
```

Utilisation :
```powershell
.\deploy.ps1
```

---

## 🐛 Dépannage

### Problème : "Firebase project not found"
**Solution** : Vérifier `.firebaserc` avec le bon ID de projet

### Problème : "404 after refresh"
**Solution** : `firebase.json` doit avoir la réécriture vers `/index.html`

### Problème : "CORS error"
**Solution** : Ajouter l'URL Firebase dans le CORS du backend

### Problème : "Backend cold start"
**Solution** : Render Free tier a des cold starts (15-30s). Upgrade au plan payant si critique.

---

## 📈 Monitoring

### Firebase Analytics
```typescript
// Dans Angular app.config.ts
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAnalytics, getAnalytics } from '@angular/fire/analytics';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAnalytics(() => getAnalytics()),
    // ...
  ]
};
```

### Render Logs
Dashboard Render → Votre service → Logs (temps réel)

---

## 💰 Coûts estimés

### Plan GRATUIT (recommandé pour démarrer)
- **Firebase Hosting** : 10 GB stockage, 360 MB/jour, domaine gratuit
- **Render.com** : 750h/mois, sleep après 15 min d'inactivité

### Limitations plan gratuit
- Render : Cold start (15-30s) après inactivité
- Pas de domaine personnalisé (ou via Firebase Hosting uniquement)

### Plan PAYANT (si besoin)
- **Firebase** : 0.026$/GB après quota gratuit
- **Render** : 7$/mois (pas de cold start, 512MB RAM)

---

## ✅ Checklist finale

- [ ] Compte Firebase créé
- [ ] Firebase CLI installé (`firebase --version`)
- [ ] `.firebaserc` configuré avec l'ID projet
- [ ] Frontend buildé et copié dans `docs/`
- [ ] `firebase deploy` exécuté avec succès
- [ ] Compte Render créé
- [ ] Backend déployé sur Render
- [ ] URL backend mise à jour dans environment.ts
- [ ] Frontend redéployé avec nouvelle URL API
- [ ] CORS configuré avec URLs Firebase
- [ ] Test de l'application en production
- [ ] Seed admin exécuté en production (si nécessaire)

---

## 🎓 Ressources

- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Render Documentation](https://render.com/docs)
- [Railway Docs](https://docs.railway.app/)
- [NestJS Production](https://docs.nestjs.com/faq/serverless)

---

## 📞 Support

En cas de problème :
1. Vérifier les logs : `firebase hosting:logs` ou Dashboard Render
2. Tester l'API backend directement : `https://votre-api.onrender.com/sales`
3. Vérifier les DevTools (Console + Network) dans le navigateur

---

**Auteur** : Guide créé pour le projet BMW Sales Analysis  
**Date** : Février 2026  
**Version** : 1.0
