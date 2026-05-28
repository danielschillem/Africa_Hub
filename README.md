# AFRIHUB — Plateforme SaaS de gestion sociale africaine

## Description
AFRIHUB permet aux entreprises africaines de gérer, publier, booster et mesurer leur impact sur Facebook, TikTok, WhatsApp et Instagram depuis un seul tableau de bord.

## Stack technique
- **Backend** : Laravel 11 + MySQL 8 + Redis
- **Frontend** : Next.js 14 + TailwindCSS + React Query
- **Queues** : Laravel Queue (Redis)
- **APIs** : Meta Graph API, TikTok Business API, Termii (WhatsApp)

## Installation rapide (Docker)
```bash
git clone [repo] && cd afrihub
cp backend/.env.example backend/.env
# Remplir les variables API dans backend/.env
docker-compose up -d
# App disponible sur http://localhost:3000
# API sur http://localhost:8000/api
```

## Compte de démonstration
- Email    : admin@afrihub.africa
- Password : password123

## Variables d'environnement obligatoires
Voir backend/.env.example pour la liste complète.
- FACEBOOK_APP_ID + FACEBOOK_APP_SECRET
- TIKTOK_CLIENT_KEY + TIKTOK_CLIENT_SECRET
- TERMII_API_KEY (WhatsApp via Termii)
- META_ADS_ACCOUNT_ID + META_ADS_ACCESS_TOKEN

## API Reference
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/posts + POST /api/posts
- GET  /api/analytics/dashboard
- POST /api/broadcasts
- POST /api/campaigns
- GET  /api/r/{tracking_code} (redirection tracking)

## Plans AFRIHUB
| Plan    | Prix/mois | Comptes | Utilisateurs |
|---------|-----------|---------|--------------|
| SOLO    | 10 000 F  | 2       | 1            |
| PME     | 25 000 F  | 4       | 3            |
| PRO     | 60 000 F  | 8       | 5            |
| AGENCE  | 150 000 F | ∞       | ∞            |
