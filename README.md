# BMW Sales Analysis

Projet de présentation avec:
- **Frontend** Angular (Firebase Hosting)
- **Backend** NestJS (Render)
- **Base de données** PostgreSQL (Supabase)

## Architecture
- `frontend/autosales-web`: SPA Angular
- `backend/bmw-project`: API NestJS + TypeORM
- `data/`: jeux de données et notebooks
- `docs/`: artefacts du build frontend (pour Firebase Hosting)

## Démarrage rapide (local)
### Backend
```
cd backend/bmw-project
npm install
```

Créer un fichier `.env` à partir de `backend/bmw-project/.env.example`.

```
npm run start:dev
```

### Frontend
```
cd frontend/autosales-web
npm install
npm start
```

## Déploiement
### Backend (Render)
- Build: `cd backend/bmw-project && npm install && npm run build`
- Start: `cd backend/bmw-project && npm run start:prod`
- Variables d'env: voir `backend/bmw-project/.env.example`

### Frontend (Firebase)
```
.\deploy.ps1
```

## Import des données (Supabase/Postgres)
```
cd backend/bmw-project

$env:DB_HOST="aws-1-eu-west-1.pooler.supabase.com"
$env:DB_PORT="5432"
$env:DB_USER="postgres.<project_ref>"
$env:DB_PASS="your_password"
$env:DB_NAME="postgres"
$env:DB_SSL="true"
$env:RESET_DB="true"

npm run import:bmw:pg
```

## Endpoints utiles
- `GET /health`
- `GET /sales`
- `GET /sales/kpi`
