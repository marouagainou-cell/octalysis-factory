# 🏭 Octalysis Factory

Outil de collecte de données et d'analyse gamification basé sur le modèle **Octalysis** (Yu-Kai Chou), conçu pour les usines et usines écoles.

---

## 🚀 Installation en 5 étapes

### 1. Créer un projet Supabase

1. Va sur [supabase.com](https://supabase.com) → **New project**
2. Donne-lui un nom (ex: `octalysis-factory`)
3. Choisis ta région → **Create project**
4. Note l'URL et la clé anonyme dans **Settings → API**

### 2. Initialiser la base de données

Dans le **SQL Editor** de Supabase, exécute dans l'ordre :

```sql
-- Étape 1 : Schéma + RLS
-- (colle le contenu de supabase/schema.sql)

-- Étape 2 : Questions initiales
-- (colle le contenu de supabase/seed.sql)
```

### 3. Configurer l'authentification Supabase

Dans **Authentication → Settings** :
- **Site URL** : `http://localhost:3000` (dev) ou ton domaine de prod
- **Email confirmations** : tu peux désactiver pour le développement
- Optionnel : configurer un provider email (SMTP) pour les emails de confirmation

### 4. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Édite `.env` :
```env
VITE_SUPABASE_URL=https://XXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 5. Lancer l'application

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) 🎉

---

## 👤 Gestion des rôles

| Rôle | Accès |
|------|-------|
| **Intervenant** | Tout : tableau de bord, résultats, réponses, gestion des questions |
| **Chef de Projet** | Questionnaire dédié, résultats, réponses des opérateurs |
| **Opérateur** | Questionnaire dédié, résultats globaux |

### Créer un compte Intervenant

Les comptes sont créés avec le rôle `operateur` par défaut (sécurité). Pour promouvoir un utilisateur en Intervenant :

**Option A — Supabase Dashboard** :
```sql
UPDATE public.profiles 
SET role = 'intervenant' 
WHERE email = 'ton@email.com';
```

**Option B — SQL Editor** de Supabase

---

## 🔒 Sécurité (Row Level Security)

Les politiques RLS garantissent que :
- Les **opérateurs** ne voient que leurs propres réponses
- Les **chefs de projet** voient leurs réponses + celles des opérateurs
- Les **intervenants** voient tout
- Seuls les **intervenants** peuvent créer/modifier/supprimer des questions
- Les questions d'un rôle ne sont pas visibles par les autres

---

## 📊 Modèle Octalysis — 8 Core Drives

| ID | Pilier | Description |
|----|--------|-------------|
| CD1 | Signification Épique | Mission, fierté, appartenance |
| CD2 | Développement | Progression, compétences, objectifs |
| CD3 | Autonomisation | Créativité, initiative, liberté |
| CD4 | Propriété | Appartenance, personnalisation |
| CD5 | Social | Équipe, collaboration, reconnaissance |
| CD6 | Rareté | Ressources, délais, valeur perçue |
| CD7 | Curiosité | Innovation, découverte, apprentissage |
| CD8 | Évitement | Pression, peur, sanctions |

---

## 🏗 Structure du projet

```
octalysis-factory/
├── src/
│   ├── lib/
│   │   └── supabase.js          # Client Supabase
│   ├── hooks/
│   │   ├── useAuth.js           # Auth context + hook
│   │   ├── useQuestions.js      # CRUD questions
│   │   └── useResponses.js      # CRUD réponses
│   ├── constants/
│   │   └── octalysis.js         # Core Drives + utilitaires
│   ├── components/
│   │   ├── Login.jsx            # Connexion / inscription
│   │   ├── Layout.jsx           # Navigation latérale
│   │   ├── Dashboard.jsx        # Tableau de bord
│   │   ├── Questionnaire.jsx    # Répondre aux questions
│   │   ├── Results.jsx          # Visualisation Octalysis
│   │   ├── Responses.jsx        # Voir les réponses (chef/intervenant)
│   │   ├── ManageQuestions.jsx  # CRUD questions (intervenant)
│   │   └── OctalysisChart.jsx   # Octagramme SVG
│   ├── App.jsx                  # Routing + guards
│   └── main.jsx
├── supabase/
│   ├── schema.sql               # Tables + RLS + triggers
│   └── seed.sql                 # 24 questions initiales
├── .env.example
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚢 Déploiement (Vercel)

```bash
npm run build
```

Sur [vercel.com](https://vercel.com) :
1. Import du repo GitHub
2. Ajouter les variables d'environnement (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
3. Deploy 🚀

N'oublie pas de mettre à jour le **Site URL** dans Supabase Auth avec ton URL Vercel.

---

## 📦 Dépendances

- **React 18** + **Vite**
- **@supabase/supabase-js** — Auth + Base de données
- **react-router-dom** — Navigation SPA
