# 🚌 SAEIV Stan v2.0 - Nancy

**Système d'Aide à l'Exploitation et à l'Information Voyageurs** pour le réseau Stan (Nancy).

Un projet portfolio technique démontrant une application **100% client-side** de simulation de réseau de transport en commun avec rendu haute-fidélité des véhicules bi-articulés.

---

## 🎯 Objectifs du Projet

- ⏰ **Moteur Temporel** - Contrôle du temps virtuel (pause, x2, x10, x100)
- 🐛 **Rendu Multi-Segments** - Buses articulés qui se plient dans les virages
- 🗺️ **Données Réelles** - GTFS Stan + OpenStreetMap
- 📊 **Modes d'Exploitation** - Régulation, Dépôt, Déviations
- 📋 **Main Courante** - Journal de bord automatique des événements
- 🚀 **Performance** - 300 véhicules simultanés à 60 FPS

---

## 🏗️ Stack Technique

- **Framework:** Next.js 16 (App Router) + TypeScript
- **State:** Zustand
- **Carte:** React-Leaflet + Leaflet
- **Géospatial:** Turf.js
- **UI:** Tailwind CSS + Shadcn/ui
- **Performance:** Web Workers, Viewport Culling, LOD adaptatif

---

## 📦 Installation

### Prérequis
- Node.js 18+ (testé avec 25.2.1)
- npm ou pnpm

### Steps

```bash
# 1. Installer les dépendances
npm install

# 2. Copier et configurer .env.local
cp .env.local.example .env.local

# 3. Lancer le serveur de dev
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

---

## 🗂️ Structure du Projet

```
saeiv-stan/
├── public/
│   ├── assets/           # SVG des bus, vidéos 360°
│   ├── data/
│   │   ├── gtfs/         # Données GTFS Stan (local dev)
│   │   └── fallback/     # Géométries OSM de secours
│   └── config/
│       └── osm-routes-mapping.json
│
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── stores/           # Zustand stores
│   ├── services/         # GTFS parser, OSM fetcher
│   ├── workers/          # Web Workers
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript types
│   └── lib/              # Utils & constants
│
├── SPECS.md              # Spécifications complètes
├── BACKLOG.md            # Backlog Agile (68 US)
└── README.md
```

---

## 📊 État du Projet

**Sprint Actuel:** Sprint 0 ✅ Complete
**Prochain Sprint:** Sprint 1 - Moteur Temporel + 1 Bus Test

Voir [BACKLOG.md](BACKLOG.md) pour le détail complet des 9 sprints planifiés.

---

## 📚 Documentation

- **[SPECS.md](SPECS.md)** - Spécifications techniques complètes
- **[BACKLOG.md](BACKLOG.md)** - Backlog Agile avec 68 User Stories

---

## 🌐 Déploiement

### Vercel (Recommandé)

1. Push le code sur GitHub
2. Importer le projet sur [Vercel](https://vercel.com)
3. Configurer les variables d'environnement
4. Deploy !

---

**Status:** 🚧 En développement actif - Sprint 0 ✅
