# Script de déploiement automatique - BMW Sales Analysis
# Usage: .\deploy.ps1

param(
    [switch]$SkipBuild = $false,
    [switch]$BackendOnly = $false,
    [switch]$FrontendOnly = $false
)

$ErrorActionPreference = "Stop"

# Couleurs
function Write-ColorOutput($message, $color = "White") {
    Write-Host $message -ForegroundColor $color
}

Write-ColorOutput "`n🚀 Déploiement BMW Sales Analysis`n" "Cyan"

# Vérifier que Firebase CLI est installé
try {
    $firebaseVersion = firebase --version
    Write-ColorOutput "✅ Firebase CLI détecté: $firebaseVersion" "Green"
} catch {
    Write-ColorOutput "❌ Firebase CLI n'est pas installé !" "Red"
    Write-ColorOutput "   Installer avec: npm install -g firebase-tools" "Yellow"
    exit 1
}

# Fonction de build frontend
function Build-Frontend {
    Write-ColorOutput "`n📦 Build du frontend Angular..." "Cyan"
    
    Set-Location "frontend\autosales-web"
    
    if (-not $SkipBuild) {
        # Vérifier node_modules
        if (-not (Test-Path "node_modules")) {
            Write-ColorOutput "   Installation des dépendances..." "Yellow"
            npm install
        }
        
        # Build production
        Write-ColorOutput "   Compilation en mode production..." "Yellow"
        npx ng build autosales-web --configuration production
        
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "❌ Erreur lors du build !" "Red"
            Set-Location "../.."
            exit 1
        }
    }
    
    Set-Location "../.."
}

# Fonction de copie vers docs
function Copy-ToDocsFolder {
    Write-ColorOutput "`n📂 Copie des fichiers vers docs/..." "Cyan"
    
    $source = "frontend\autosales-web\dist\autosales-web\browser"
    $destination = "docs"
    
    # Vérifier que le dossier source existe
    if (-not (Test-Path $source)) {
        Write-ColorOutput "❌ Dossier de build introuvable: $source" "Red"
        Write-ColorOutput "   Veuillez d'abord builder le frontend" "Yellow"
        exit 1
    }
    
    # Vider le dossier docs
    if (Test-Path $destination) {
        Write-ColorOutput "   Nettoyage du dossier docs..." "Yellow"
        Remove-Item -Path "$destination\*" -Recurse -Force
    } else {
        New-Item -ItemType Directory -Path $destination | Out-Null
    }
    
    # Copier les fichiers
    Copy-Item -Path "$source\*" -Destination $destination -Recurse -Force
    
    $fileCount = (Get-ChildItem -Path $destination -Recurse -File).Count
    Write-ColorOutput "   ✅ $fileCount fichiers copiés" "Green"
}

# Fonction de déploiement Firebase
function Deploy-Firebase {
    Write-ColorOutput "`n🔥 Déploiement sur Firebase Hosting..." "Cyan"
    
    # Vérifier que .firebaserc existe
    if (-not (Test-Path ".firebaserc")) {
        Write-ColorOutput "❌ Fichier .firebaserc introuvable !" "Red"
        Write-ColorOutput "   Veuillez configurer Firebase avec: firebase init hosting" "Yellow"
        exit 1
    }
    
    # Lire le projet Firebase
    $firebaserc = Get-Content ".firebaserc" | ConvertFrom-Json
    $projectId = $firebaserc.projects.default
    
    if ($projectId -eq "votre-projet-firebase-id") {
        Write-ColorOutput "⚠️  Le projet Firebase n'est pas configuré !" "Yellow"
        Write-ColorOutput "   Modifier .firebaserc avec votre ID de projet" "Yellow"
        
        $continue = Read-Host "   Continuer quand même ? (o/N)"
        if ($continue -ne "o" -and $continue -ne "O") {
            exit 0
        }
    }
    
    Write-ColorOutput "   Projet Firebase: $projectId" "Cyan"
    Write-ColorOutput "   Déploiement en cours..." "Yellow"
    
    # Déployer
    firebase deploy --only hosting
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "`n✅ Déploiement réussi !" "Green"
        Write-ColorOutput "🌐 Site accessible sur:" "Cyan"
        Write-ColorOutput "   https://$projectId.web.app" "Yellow"
        Write-ColorOutput "   https://$projectId.firebaseapp.com`n" "Yellow"
    } else {
        Write-ColorOutput "`n❌ Erreur lors du déploiement Firebase" "Red"
        exit 1
    }
}

# Fonction pour afficher l'aide
function Show-Help {
    Write-ColorOutput @"
    
Usage: .\deploy.ps1 [options]

Options:
  -SkipBuild        Ne pas rebuilder le frontend (utiliser le build existant)
  -FrontendOnly     Déployer uniquement le frontend
  -BackendOnly      Afficher les instructions pour le backend
  
Exemples:
  .\deploy.ps1                    # Build + déploiement complet
  .\deploy.ps1 -SkipBuild         # Déployer sans rebuilder
  .\deploy.ps1 -BackendOnly       # Instructions backend
  
"@ "White"
}

# Logique principale
if ($BackendOnly) {
    Write-ColorOutput @"
    
🖥️  DÉPLOIEMENT DU BACKEND

Le backend NestJS doit être déployé séparément.
Options recommandées:

1. Render.com (gratuit)
   → https://render.com/
   → Connecter votre dépôt GitHub
   → Créer un Web Service
   → Build: cd backend/bmw-project && npm install && npm run build
   → Start: cd backend/bmw-project && npm run start:prod

2. Railway.app (gratuit 500h/mois)
   → https://railway.app/
   → railway up

3. Fly.io (gratuit)
   → https://fly.io/
   → fly launch

Après déploiement, mettre à jour l'URL API dans:
frontend/autosales-web/src/environments/environment.ts

Voir DEPLOIEMENT_FIREBASE.md pour plus de détails.

"@ "Cyan"
    exit 0
}

if ($FrontendOnly -or -not $BackendOnly) {
    # Déploiement frontend
    Build-Frontend
    Copy-ToDocsFolder
    Deploy-Firebase
    
    Write-ColorOutput "`n📝 Prochaines étapes:" "Cyan"
    Write-ColorOutput "   1. Déployer le backend sur Render/Railway" "White"
    Write-ColorOutput "   2. Mettre à jour environment.ts avec l'URL backend" "White"
    Write-ColorOutput "   3. Rebuilder et redéployer le frontend" "White"
    Write-ColorOutput "`n   Voir DEPLOIEMENT_FIREBASE.md pour les détails`n" "Yellow"
}
