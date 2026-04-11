# AvisFlow

Plateforme d'automatisation des avis Google pour les commerces locaux.

## Concept

Les commerçants placent un QR code dans leur boutique. Le client le scanne et note son experience :
- **4-5 etoiles** : redirige vers Google pour laisser un avis positif public
- **1-3 etoiles** : formulaire de feedback prive (pas d'avis negatif sur Google)

Resultat : la note Google du commerce monte automatiquement.

## Stack technique

- **Backend** : FastAPI (Python) + SQLite
- **Frontend** : React + Vite + Tailwind CSS + shadcn/ui
- **Deploiement** : Docker Compose

## Installation rapide

```bash
# 1. Cloner le repo
git clone https://github.com/amavaljoh04-lang/avisflow.git
cd avisflow

# 2. Configurer
cp .env.example .env
# Editez .env pour changer SECRET_KEY

# 3. Lancer
docker-compose up -d

# L'application est accessible sur http://localhost
```

## Developpement local

### Backend

```bash
cd avisflow-backend
pip install poetry
poetry install
DATABASE_PATH=./dev.db poetry run fastapi dev app/main.py --port 8000
```

### Frontend

```bash
cd avisflow-frontend
npm install
npm run dev
```

Le frontend tourne sur `http://localhost:5173` et le backend sur `http://localhost:8000`.

## Fonctionnalites

- Systeme d'authentification complet (inscription/connexion/JWT)
- Gestion multi-etablissements
- Generation de QR codes personnalises
- Page de collecte d'avis mobile-optimisee
- Redirection intelligente vers Google (avis positifs) / feedback prive (avis negatifs)
- Dashboard analytics (notes, distribution, scans)
- Panel d'administration (gestion utilisateurs, statistiques globales)

## Creer un compte admin

Apres avoir cree un compte utilisateur normal, executez :

```bash
# Avec Docker
docker exec -it avisflow-backend python -c "
import sqlite3
conn = sqlite3.connect('/data/avisflow.db')
conn.execute(\"UPDATE users SET role='admin' WHERE email='votre@email.com'\")
conn.commit()
conn.close()
print('Admin role set!')
"
```

## Architecture

```
avisflow/
├── docker-compose.yml
├── .env.example
├── avisflow-backend/
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models/schemas.py
│       ├── utils/auth.py
│       └── routers/
│           ├── auth.py
│           ├── businesses.py
│           ├── reviews.py
│           ├── qrcodes.py
│           ├── analytics.py
│           └── admin.py
└── avisflow-frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── App.tsx
        ├── lib/api.ts
        ├── hooks/useAuth.ts
        └── pages/
            ├── Landing.tsx
            ├── Login.tsx
            ├── Register.tsx
            ├── Dashboard.tsx
            ├── BusinessDetail.tsx
            ├── ReviewPage.tsx
            └── AdminPanel.tsx
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Businesses (authentifie)
- `POST /api/businesses` - Creer un etablissement
- `GET /api/businesses` - Lister mes etablissements
- `GET /api/businesses/{id}` - Details d'un etablissement
- `PUT /api/businesses/{id}` - Modifier
- `DELETE /api/businesses/{id}` - Supprimer

### Reviews
- `POST /api/r/{slug}` - Soumettre un avis (public)
- `GET /api/r/{slug}/info` - Info etablissement (public)
- `GET /api/businesses/{id}/reviews` - Lister les avis (authentifie)

### QR Codes (authentifie)
- `POST /api/businesses/{id}/qrcodes` - Creer un QR code
- `GET /api/businesses/{id}/qrcodes` - Lister les QR codes
- `GET /api/businesses/{id}/qrcodes/{qr_id}/image` - Image QR (PNG)
- `DELETE /api/businesses/{id}/qrcodes/{qr_id}` - Supprimer

### Analytics (authentifie)
- `GET /api/businesses/{id}/analytics` - Statistiques

### Admin (admin uniquement)
- `GET /api/admin/stats` - Statistiques globales
- `GET /api/admin/users` - Liste des utilisateurs
- `GET /api/admin/businesses` - Liste des etablissements
- `GET /api/admin/reviews` - Avis recents
- `PUT /api/admin/users/{id}/role` - Changer le role
- `PUT /api/admin/users/{id}/toggle` - Activer/desactiver

## Licence

MIT
