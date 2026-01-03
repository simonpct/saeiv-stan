# 📋 BACKLOG AGILE - SAEIV Stan v2.0

**Projet :** SAEIV Client-Side pour réseau Stan (Nancy)
**Méthodologie :** Scrum adapté (sprints de 1-2 semaines)
**Date de création :** 2026-01-03
**Status :** En cours

---

## 📊 Vue d'Ensemble du Backlog

### Résumé des Sprints

| Sprint | Durée | Objectif Principal | Story Points | Status |
|--------|-------|-------------------|--------------|--------|
| **Sprint 0** | 1 jour | Setup & Infrastructure | 8 | 🔄 To Do |
| **Sprint 1** | 3-5 jours | Moteur Temporel + 1 Bus Test | 21 | ⏸️ Pending |
| **Sprint 2** | 5-7 jours | Rendu Multi-Segments + Performance | 34 | ⏸️ Pending |
| **Sprint 3** | 3-4 jours | Données Complètes + Cache | 21 | ⏸️ Pending |
| **Sprint 4** | 5-7 jours | Mode A: Régulation | 21 | ⏸️ Pending |
| **Sprint 5** | 5-7 jours | Mode B: Dépôt + Mode C: Déviations | 34 | ⏸️ Pending |
| **Sprint 6** | 4-5 jours | Main Courante (Logbook) | 21 | ⏸️ Pending |
| **Sprint 7** | 5-7 jours | Jumeau Numérique | 34 | ⏸️ Pending |
| **Sprint 8** | 4-5 jours | Polish, Tests, Optimisation | 21 | ⏸️ Pending |
| **Sprint 9** | 2-3 jours | Documentation + Déploiement | 13 | ⏸️ Pending |

**Total Story Points :** 228
**Durée Estimée :** 8-12 semaines

---

## 🏃 SPRINT 0 : Setup & Infrastructure (1 jour - 8 SP)

**Objectif :** Préparer l'environnement de développement et la structure de base du projet.

### Epic 0.1 : Initialisation du Projet

#### US-0.1.1 : Setup Next.js 14+
**En tant que** développeur
**Je veux** initialiser un projet Next.js 14 avec App Router
**Afin de** avoir une base solide pour l'application

**Acceptance Criteria :**
- [x] Projet Next.js 14+ créé avec `create-next-app`
- [x] App Router configuré (pas de Pages Router)
- [x] TypeScript strict activé (`strict: true`)
- [x] Configuration `next.config.js` pour Web Workers
- [x] `npm run dev` démarre sans erreur

**Story Points :** 2
**Priority :** Critical
**Tasks :**
- [ ] `npx create-next-app@latest saeiv-stan --typescript --tailwind --app`
- [ ] Configurer `next.config.js` pour Web Workers
- [ ] Vérifier TypeScript config (strict mode)

---

#### US-0.1.2 : Installation des Dépendances
**En tant que** développeur
**Je veux** installer toutes les dépendances nécessaires
**Afin de** pouvoir utiliser les bibliothèques requises

**Acceptance Criteria :**
- [x] Zustand installé et configuré
- [x] React-Leaflet + Leaflet installés
- [x] @turf/turf installé
- [x] Toutes les dépendances du SPECS.md installées
- [x] Types TypeScript pour toutes les libs

**Story Points :** 1
**Priority :** Critical
**Dependencies :** US-0.1.1

**Commande :**
```bash
npm install zustand leaflet react-leaflet @turf/turf osmtogeojson rbush query-overpass
npm install -D @types/leaflet @types/geojson
npm install tailwindcss postcss autoprefixer
npm install lucide-react clsx tailwind-merge
```

---

#### US-0.1.3 : Structure de Dossiers
**En tant que** développeur
**Je veux** créer toute l'arborescence du projet
**Afin de** organiser le code dès le début

**Acceptance Criteria :**
- [x] Tous les dossiers de `SPECS.md Section 7` créés
- [x] `.gitignore` configuré (node_modules, .env.local, etc.)
- [x] README.md de base créé

**Story Points :** 1
**Priority :** High
**Dependencies :** US-0.1.1

---

#### US-0.1.4 : Configuration Tailwind + Shadcn/ui
**En tant que** développeur
**Je veux** configurer Tailwind CSS et installer Shadcn/ui
**Afin de** avoir un système de design cohérent

**Acceptance Criteria :**
- [x] `tailwind.config.ts` configuré
- [x] `globals.css` avec base Tailwind
- [x] Shadcn/ui initialisé (`npx shadcn-ui@latest init`)
- [x] Composants de base installés (button, card, dialog, tabs)

**Story Points :** 2
**Priority :** High
**Dependencies :** US-0.1.1

---

#### US-0.1.5 : Configuration Git & Repo
**En tant que** développeur
**Je veux** initialiser Git et créer le repository
**Afin de** versionner le code

**Acceptance Criteria :**
- [x] `git init` exécuté
- [x] Premier commit "Initial setup"
- [x] Repository GitHub/GitLab créé (optionnel)
- [x] `.env.local.example` créé

**Story Points :** 1
**Priority :** Medium
**Dependencies :** US-0.1.3

---

#### US-0.1.6 : Intégration Données GTFS
**En tant que** développeur
**Je veux** intégrer les fichiers GTFS Stan dans le projet
**Afin de** les utiliser via URL distante en production

**Acceptance Criteria :**
- [x] Créer `/public/data/gtfs/` (pour dev local)
- [x] Copier fichiers GTFS locaux pour tests
- [x] Créer `.env.local` avec URL GTFS distante
- [x] Documentation sur switch local/distant

**Story Points :** 1
**Priority :** High
**Dependencies :** US-0.1.3

**Variables d'environnement :**
```env
NEXT_PUBLIC_GTFS_URL=https://example.com/gtfs-stan.zip
NEXT_PUBLIC_USE_LOCAL_GTFS=true # dev mode
```

---

## 🏃 SPRINT 1 : Moteur Temporel + 1 Bus Test (3-5 jours - 21 SP)

**Objectif :** Avoir un bus qui se déplace sur une ligne selon le GTFS avec contrôle du temps.

### Epic 1.1 : Types TypeScript

#### US-1.1.1 : Créer les Types de Base
**En tant que** développeur
**Je veux** définir tous les types TypeScript
**Afin de** avoir une base type-safe

**Acceptance Criteria :**
- [x] `src/types/vehicle-model.ts` créé (BusType, BusModelStats, etc.)
- [x] `src/types/fleet.ts` créé (BusInstance, VehicleState, etc.)
- [x] `src/types/gtfs.ts` créé (GTFSStop, GTFSRoute, etc.)
- [x] `src/types/osm.ts` créé (OSMRouteConfig, etc.)
- [x] Tous les exemples du SPECS.md implémentés
- [x] Pas d'erreurs TypeScript

**Story Points :** 3
**Priority :** Critical
**Tasks :**
- [ ] Créer chaque fichier de types
- [ ] Copier/adapter les interfaces du SPECS.md
- [ ] Ajouter JSDoc pour documentation
- [ ] Vérifier avec `tsc --noEmit`

---

### Epic 1.2 : Zustand Stores

#### US-1.2.1 : Store Time (Temps Virtuel)
**En tant qu'** utilisateur
**Je veux** pouvoir contrôler le temps de la simulation
**Afin de** naviguer dans les horaires à ma guise

**Acceptance Criteria :**
- [x] `src/stores/useTimeStore.ts` créé
- [x] State: `virtualTimestamp`, `speedFactor`, `isPaused`
- [x] Actions: `setTime()`, `setSpeed()`, `togglePause()`, `updateTime()`
- [x] Persist state dans localStorage (optionnel)
- [x] Tests manuels OK (changement vitesse, pause)

**Story Points :** 3
**Priority :** Critical
**Dependencies :** US-1.1.1

**Interface :**
```typescript
interface TimeState {
  virtualTimestamp: number;
  speedFactor: 1 | 2 | 5 | 10 | 30 | 60 | 100;
  isPaused: boolean;
  setTime: (timestamp: number) => void;
  setSpeed: (factor: number) => void;
  togglePause: () => void;
  updateTime: (deltaMs: number) => void;
}
```

---

#### US-1.2.2 : Store Fleet (Flotte)
**En tant que** système
**Je veux** gérer l'état de tous les véhicules
**Afin de** centraliser les données de position

**Acceptance Criteria :**
- [x] `src/stores/useFleetStore.ts` créé
- [x] State: `vehicles: BusInstance[]`
- [x] Actions: `updatePositions()`, `addVehicle()`, `getBusById()`
- [x] Initialisation avec 1 bus test
- [x] Tests manuels OK

**Story Points :** 2
**Priority :** Critical
**Dependencies :** US-1.1.1

---

#### US-1.2.3 : Store Map (Géométries OSM)
**En tant que** système
**Je veux** cacher les géométries OSM
**Afin de** éviter de refetch à chaque fois

**Acceptance Criteria :**
- [x] `src/stores/useMapStore.ts` créé
- [x] State: `geometries: Map<string, GeoJSON.LineString>`
- [x] Actions: `setGeometry()`, `getGeometry()`, `clearCache()`
- [x] Persist dans localStorage avec expiration (7 jours)
- [x] Tests manuels OK

**Story Points :** 2
**Priority :** High
**Dependencies :** US-1.1.1

---

### Epic 1.3 : Parsing GTFS

#### US-1.3.1 : Parser GTFS Basique
**En tant que** système
**Je veux** parser les fichiers GTFS
**Afin d'** extraire les données nécessaires

**Acceptance Criteria :**
- [x] `src/services/gtfsParser.ts` créé
- [x] Fonction `parseRoutes()` lit routes.txt
- [x] Fonction `parseStops()` lit stops.txt
- [x] Fonction `parseTrips()` lit trips.txt
- [x] Fonction `parseStopTimes()` lit stop_times.txt
- [x] Support CSV (parsing avec Papa Parse ou manuel)
- [x] Test avec 1 ligne (ex: T1)

**Story Points :** 5
**Priority :** Critical
**Dependencies :** US-1.1.1

**Signature :**
```typescript
async function parseGTFS(baseUrl: string): Promise<{
  routes: GTFSRoute[];
  stops: GTFSStop[];
  trips: GTFSTrip[];
  stopTimes: GTFSStopTime[];
}>;
```

---

### Epic 1.4 : Interface Time Controller

#### US-1.4.1 : Composant TimeController UI
**En tant qu'** utilisateur
**Je veux** voir et contrôler le temps
**Afin de** naviguer dans la simulation

**Acceptance Criteria :**
- [x] `src/components/timeline/TimeController.tsx` créé
- [x] Affiche l'heure virtuelle (HH:MM:SS)
- [x] Boutons: Pause, Play
- [x] Sélecteur de vitesse (x1, x2, x5, x10, x30, x60, x100)
- [x] Bind avec Zustand useTimeStore
- [x] Design responsive (stick en bas d'écran)

**Story Points :** 3
**Priority :** High
**Dependencies :** US-1.2.1

**Mockup :**
```
┌────────────────────────────────────────┐
│ ⏸️ ▶️ │ 14:35:22 │ Speed: [x10 ▼]    │
└────────────────────────────────────────┘
```

---

### Epic 1.5 : Carte Leaflet

#### US-1.5.1 : Composant MapView
**En tant qu'** utilisateur
**Je veux** voir une carte interactive
**Afin de** visualiser le réseau

**Acceptance Criteria :**
- [x] `src/components/map/MapView.tsx` créé
- [x] React-Leaflet configuré
- [x] Tiles OpenStreetMap affichées
- [x] Centre sur Nancy (lat: 48.6921, lng: 6.1844)
- [x] Zoom initial: 13
- [x] Pas d'erreurs console

**Story Points :** 2
**Priority :** Critical
**Dependencies :** US-0.1.2

---

### Epic 1.6 : Boucle d'Animation

#### US-1.6.1 : Hook useAnimationLoop
**En tant que** système
**Je veux** une boucle requestAnimationFrame
**Afin de** mettre à jour le temps virtuel à 60 FPS

**Acceptance Criteria :**
- [x] `src/hooks/useAnimationLoop.ts` créé
- [x] RAF loop qui appelle `updateTime(delta)`
- [x] S'arrête quand isPaused = true
- [x] Cleanup correct (cancelAnimationFrame)
- [x] Console.log montre mise à jour temps

**Story Points :** 2
**Priority :** Critical
**Dependencies :** US-1.2.1

---

### Epic 1.7 : Premier Bus Test

#### US-1.7.1 : Bus Statique sur la Carte
**En tant qu'** utilisateur
**Je veux** voir 1 bus (icône simple) sur la carte
**Afin de** valider le rendu basique

**Acceptance Criteria :**
- [x] `src/components/map/BusMarker.tsx` créé (version simple)
- [x] 1 bus affiché à une position fixe (ex: Place Stanislas)
- [x] Icône SVG basique (rectangle coloré)
- [x] Tooltip avec ID du bus au hover
- [x] Visible sur la carte

**Story Points :** 2
**Priority :** High
**Dependencies :** US-1.5.1, US-1.2.2

---

#### US-1.7.2 : Bus en Mouvement (Mock Data)
**En tant qu'** utilisateur
**Je veux** voir le bus se déplacer
**Afin de** valider l'animation

**Acceptance Criteria :**
- [x] Position du bus mise à jour chaque frame
- [x] Mouvement le long d'un tracé simple (LineString mocké)
- [x] Vitesse dépend de speedFactor
- [x] Bus s'arrête quand isPaused = true
- [x] Mouvement fluide (60 FPS)

**Story Points :** 3
**Priority :** High
**Dependencies :** US-1.7.1, US-1.6.1

**Algorithme simplifié :**
```typescript
// Dans RAF loop
const routeLine = mockLineString; // Hardcodé pour test
const progress = (virtualTime % 60000) / 60000; // Boucle de 60s
const totalDist = turf.length(routeLine, { units: 'meters' });
const currentDist = progress * totalDist;
const position = turf.along(routeLine, currentDist, { units: 'meters' });
```

---

#### US-1.7.3 : Bus Suit GTFS Trip Réel
**En tant qu'** utilisateur
**Je veux** que le bus suive un trip GTFS réel
**Afin de** respecter les horaires théoriques

**Acceptance Criteria :**
- [x] Parser 1 trip de la ligne T1 (ou autre)
- [x] Calculer position selon stop_times
- [x] Bus passe par les arrêts aux bonnes heures
- [x] Test: jump à une heure précise, bus est au bon endroit
- [x] Console.log affiche arrêt actuel et prochain

**Story Points :** 5
**Priority :** Critical
**Dependencies :** US-1.3.1, US-1.7.2

**Algorithme :**
```typescript
function calculatePosition(bus, virtualTime, stopTimes, routeLine) {
  // 1. Trouver segment actif (stopA -> stopB)
  const segment = findActiveSegment(stopTimes, virtualTime);

  // 2. Calculer % progression temporelle
  const progress = (virtualTime - segment.departureTime) /
                   (segment.arrivalTime - segment.departureTime);

  // 3. Interpoler position sur routeLine
  const distA = findStopDistance(segment.stopA, routeLine);
  const distB = findStopDistance(segment.stopB, routeLine);
  const currentDist = distA + (distB - distA) * progress;

  // 4. Position finale
  return turf.along(routeLine, currentDist, { units: 'meters' });
}
```

---

## 🏃 SPRINT 2 : Rendu Multi-Segments + Performance (5-7 jours - 34 SP)

**Objectif :** Bi-articulation fluide + Optimisations pour 50+ bus.

### Epic 2.1 : Web Worker

#### US-2.1.1 : Position Solver Worker
**En tant que** système
**Je veux** déporter les calculs dans un Worker
**Afin de** ne pas bloquer le thread principal

**Acceptance Criteria :**
- [x] `src/workers/positionWorker.ts` créé
- [x] Worker reçoit: virtualTime, vehicles, geometries, stopTimes
- [x] Worker retourne: positions calculées
- [x] Communication via postMessage
- [x] Test: 10 bus calculés sans lag UI

**Story Points :** 5
**Priority :** Critical
**Dependencies :** US-1.7.3

---

### Epic 2.2 : Rendu Multi-Segments

#### US-2.2.1 : Modèles de Bus (BusModelStats)
**En tant que** développeur
**Je veux** définir les modèles de bus
**Afin de** connaître leurs dimensions

**Acceptance Criteria :**
- [x] STANDARD_12M défini dans vehicle-model.ts
- [x] ARTICULATED_18M défini avec 2 segments
- [x] HESS_LIGHTRAM_25 défini avec 3 segments
- [x] Offsets corrects entre segments
- [x] Export `BUS_MODELS` disponible

**Story Points :** 2
**Priority :** High
**Dependencies :** US-1.1.1

---

#### US-2.2.2 : Calcul Multi-Points (Articulation)
**En tant que** système
**Je veux** calculer la position de chaque segment
**Afin de** rendre l'articulation

**Acceptance Criteria :**
- [x] Pour un bus bi-articulé, calculer 3 positions (head, trailer1, trailer2)
- [x] Utiliser `turf.along` avec offsets
- [x] Calculer bearing de chaque segment
- [x] Test: segments suivent bien la courbure

**Story Points :** 5
**Priority :** Critical
**Dependencies :** US-2.2.1, US-2.1.1

**Algorithme :**
```typescript
const segments = model.segments.map(seg => {
  const dist = Math.max(0, distHead - seg.offset);
  const point = turf.along(routeLine, dist, { units: 'meters' });
  const nextPoint = turf.along(routeLine, dist + 1, { units: 'meters' });
  const bearing = turf.bearing(point, nextPoint);
  return { lat, lng, bearing };
});
```

---

#### US-2.2.3 : BusMarker Multi-Segments
**En tant qu'** utilisateur
**Je veux** voir les bus articulés se plier dans les virages
**Afin d'** avoir un rendu réaliste

**Acceptance Criteria :**
- [x] BusMarker.tsx supporte multi-segments
- [x] Affiche plusieurs Markers Leaflet (1 par segment)
- [x] Chaque segment orienté selon son bearing
- [x] SVG placeholder (rectangles colorés) pour chaque segment
- [x] Test visuel: bus se plie dans un virage

**Story Points :** 5
**Priority :** High
**Dependencies :** US-2.2.2

---

#### US-2.2.4 : SVG Placeholder pour Bus
**En tant que** designer
**Je veux** créer des SVG simples pour les bus
**Afin de** les afficher en attendant les vrais designs

**Acceptance Criteria :**
- [x] `/public/assets/bus/standard-12m.svg` créé (rectangle bleu)
- [x] `/public/assets/bus/articulated-head.svg` créé
- [x] `/public/assets/bus/articulated-tail.svg` créé
- [x] `/public/assets/bus/hess-head.svg` créé
- [x] `/public/assets/bus/hess-middle.svg` créé
- [x] `/public/assets/bus/hess-tail.svg` créé
- [x] Dimensions: 100x30px (vue top-down)

**Story Points :** 3
**Priority :** Medium
**Dependencies :** None

**Template SVG :**
```svg
<svg width="100" height="30" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="30" fill="#3B82F6" stroke="#1E40AF" stroke-width="2"/>
  <rect x="10" y="8" width="12" height="14" fill="#FFFFFF" opacity="0.5"/>
  <!-- Fenêtres répétées -->
</svg>
```

---

### Epic 2.3 : LOD (Level of Detail)

#### US-2.3.1 : Détection Zoom Level
**En tant que** système
**Je veux** adapter le rendu selon le zoom
**Afin d'** optimiser la performance

**Acceptance Criteria :**
- [x] Hook `useMapZoom()` qui retourne le zoom actuel
- [x] Logique:
  - Zoom < 13: rendu icône simple
  - Zoom 13-15: rendu bi-segment (head + tail)
  - Zoom > 15: rendu tri-segment complet
- [x] Test: zoomer/dézoomer, rendu s'adapte

**Story Points :** 3
**Priority :** High
**Dependencies :** US-1.5.1

---

#### US-2.3.2 : Application LOD dans BusMarker
**En tant qu'** utilisateur
**Je veux** que les bus soient plus détaillés quand je zoom
**Afin de** garder de bonnes performances

**Acceptance Criteria :**
- [x] BusMarker.tsx utilise `useMapZoom()`
- [x] Rendu conditionnel selon LOD
- [x] Icône simple = 1 seul Marker
- [x] Multi-segment = plusieurs Markers
- [x] Test: 50 bus, FPS reste > 30

**Story Points :** 3
**Priority :** High
**Dependencies :** US-2.3.1, US-2.2.3

---

### Epic 2.4 : Viewport Culling

#### US-2.4.1 : Filtre Bus Visibles
**En tant que** système
**Je veux** ne calculer que les bus visibles
**Afin de** économiser du CPU

**Acceptance Criteria :**
- [x] Hook `useViewportCulling()` créé
- [x] Récupère bounds de la carte Leaflet
- [x] Filtre `vehicles` pour ne garder que ceux dans viewport (+10% marge)
- [x] Bus hors viewport: update à 2 FPS au lieu de 60 FPS
- [x] Test: 100 bus, seuls 20 visibles calculés à haute fréquence

**Story Points :** 5
**Priority :** Critical
**Dependencies :** US-2.1.1

---

#### US-2.4.2 : Index Spatial (RBush)
**En tant que** système
**Je veux** utiliser un index spatial
**Afin de** requêter rapidement les bus visibles

**Acceptance Criteria :**
- [x] RBush intégré dans useMapStore
- [x] Insertion des bus dans l'index à chaque update
- [x] Query avec bounds de viewport
- [x] Benchmark: 300 bus, query < 1ms

**Story Points :** 5
**Priority :** High
**Dependencies :** US-2.4.1

---

### Epic 2.5 : Tests Performance

#### US-2.5.1 : Test 50 Bus Simultanés
**En tant que** QA
**Je veux** tester 50 bus simultanés
**Afin de** valider la performance

**Acceptance Criteria :**
- [x] Script de génération de 50 bus (faker data)
- [x] 50 bus affichés sur la carte
- [x] FPS > 60 (zoom > 15)
- [x] FPS > 30 (zoom < 13)
- [x] Pas de freeze UI

**Story Points :** 3
**Priority :** Critical
**Dependencies :** US-2.4.2

---

## 🏃 SPRINT 3 : Données Complètes + Cache (3-4 jours - 21 SP)

**Objectif :** Charger toutes les lignes Stan + Cache intelligent.

### Epic 3.1 : Parsing GTFS Complet

#### US-3.1.1 : Parser Toutes les Lignes
**En tant que** système
**Je veux** parser toutes les 40 lignes GTFS
**Afin d'** avoir le réseau complet

**Acceptance Criteria :**
- [x] Parser routes.txt complet (40 lignes)
- [x] Parser stops.txt complet (~1,450 arrêts)
- [x] Parser trips.txt complet (~21,800 trips)
- [x] Parser stop_times.txt complet (~774,000 horaires)
- [x] Optimisation: indexation en Map pour accès rapide
- [x] Test: Temps de parsing < 5s

**Story Points :** 5
**Priority :** Critical
**Dependencies :** US-1.3.1

---

#### US-3.1.2 : Parser Shapes (Tracés GTFS)
**En tant que** système
**Je veux** parser shapes.txt
**Afin d'** avoir les tracés théoriques

**Acceptance Criteria :**
- [x] Parser shapes.txt (~23,800 points)
- [x] Convertir en GeoJSON LineString
- [x] Regrouper par shape_id
- [x] Test: 1 shape converti correctement

**Story Points :** 3
**Priority :** High
**Dependencies :** US-3.1.1

---

### Epic 3.2 : OSM Integration

#### US-3.2.1 : Fichier osm-routes-mapping.json
**En tant que** développeur
**Je veux** mapper GTFS routes vers OSM relations
**Afin de** lier les deux sources

**Acceptance Criteria :**
- [x] `/public/config/osm-routes-mapping.json` créé
- [x] Au moins 5 lignes principales mappées (T1-T5)
- [x] Structure: `{ gtfs_route_id, osm_relation_id, preload, color }`
- [x] Documentation: comment trouver relation IDs

**Story Points :** 2
**Priority :** High
**Dependencies :** None

**Exemple :**
```json
{
  "routes": [
    {
      "gtfs_route_id": "1",
      "route_short_name": "T1",
      "osm_relation_id": 1234567,
      "color": "#E30613",
      "preload": true
    }
  ]
}
```

---

#### US-3.2.2 : Service OSM Fetcher
**En tant que** système
**Je veux** fetcher des relations OSM via Overpass
**Afin d'** obtenir les géométries réelles

**Acceptance Criteria :**
- [x] `src/services/osmFetcher.ts` créé
- [x] Fonction `fetchOSMRelation(relationId)` → GeoJSON
- [x] Utilise Overpass API
- [x] Conversion avec `osmtogeojson`
- [x] Test: fetch relation T1 réussit

**Story Points :** 5
**Priority :** Critical
**Dependencies :** US-3.2.1

**Query Overpass :**
```typescript
const query = `
[out:json][timeout:25];
relation(${relationId});
(._;>;);
out geom;
`;
```

---

### Epic 3.3 : Cache Manager

#### US-3.3.1 : Service Cache LocalStorage
**En tant que** système
**Je veux** cacher les géométries OSM
**Afin d'** éviter de refetch à chaque visite

**Acceptance Criteria :**
- [x] `src/services/cacheManager.ts` créé
- [x] Fonctions: `set()`, `get()`, `has()`, `clear()`
- [x] Expiration après 7 jours
- [x] Versioning (hash MD5 de la géométrie)
- [x] Test: données persistantes après refresh

**Story Points :** 3
**Priority :** High
**Dependencies :** US-3.2.2

**Interface :**
```typescript
interface CacheEntry {
  data: GeoJSON.LineString;
  timestamp: number;
  version: string;
}

function set(key: string, data: any, ttl: number): void;
function get(key: string): any | null;
```

---

#### US-3.3.2 : Stratégie Preload + Lazy Load
**En tant qu'** utilisateur
**Je veux** que les lignes principales se chargent vite
**Afin de** commencer à utiliser l'app rapidement

**Acceptance Criteria :**
- [x] Au démarrage: preload T1-T5 (flag `preload: true`)
- [x] Lignes secondaires: chargées à la demande (user sélectionne)
- [x] Loading spinner pendant fetch
- [x] Cache utilisé en priorité
- [x] Test: refresh page, T1-T5 chargées depuis cache (< 1s)

**Story Points :** 5
**Priority :** High
**Dependencies :** US-3.3.1, US-3.2.2

---

### Epic 3.4 : Fallback Statique

#### US-3.4.1 : Géométries de Secours
**En tant que** système
**Je veux** avoir des géométries statiques
**Afin de** fonctionner si Overpass est down

**Acceptance Criteria :**
- [x] `/public/data/fallback/` créé
- [x] T1.geojson, T2.geojson, etc. (au moins 3 lignes)
- [x] Script pour DL et sauvegarder les géométries
- [x] Fallback auto si fetch Overpass échoue
- [x] Test: déconnecter réseau, app fonctionne avec fallback

**Story Points :** 3
**Priority :** Medium
**Dependencies :** US-3.2.2

---

## 🏃 SPRINT 4 : Mode A - Régulation (5-7 jours - 21 SP)

**Objectif :** Interface de régulation avec filtres et thermomètre de ponctualité.

### Epic 4.1 : Filtrage Lignes

#### US-4.1.1 : Sidebar Filtres
**En tant qu'** utilisateur
**Je veux** filtrer par ligne
**Afin de** voir uniquement les bus qui m'intéressent

**Acceptance Criteria :**
- [x] `src/components/modes/RegulationMode.tsx` créé
- [x] Sidebar gauche avec liste des lignes
- [x] Multi-select (checkboxes)
- [x] Afficher couleur de chaque ligne
- [x] Filtrage appliqué immédiatement sur la carte
- [x] Test: cocher T1, seuls bus T1 affichés

**Story Points :** 5
**Priority :** High
**Dependencies :** US-3.1.1

---

### Epic 4.2 : Thermomètre de Ligne

#### US-4.2.1 : Calcul Ponctualité
**En tant que** système
**Je veux** calculer la ponctualité d'une ligne
**Afin d'** afficher un indicateur visuel

**Acceptance Criteria :**
- [x] Fonction `calculatePunctuality(lineId, virtualTime)`
- [x] Pour chaque bus de la ligne:
  - Comparer heure théorique (GTFS) vs heure actuelle (virtualTime)
  - Retard si diff > +3 min
  - Avance si diff > -5 min
- [x] Retourne % de ponctualité (courses à l'heure / total)
- [x] Test: 10 bus, 7 à l'heure → 70%

**Story Points :** 5
**Priority :** High
**Dependencies :** US-1.7.3

**Formula :**
```typescript
punctuality = (busesOnTime / totalBuses) * 100;
// On time = -3 min < diff < +3 min
```

---

#### US-4.2.2 : Composant Thermomètre UI
**En tant qu'** utilisateur
**Je veux** voir un thermomètre visuel de la ponctualité
**Afin d'** identifier rapidement les lignes en difficulté

**Acceptance Criteria :**
- [x] Composant `LineHealthIndicator.tsx`
- [x] Affiche % ponctualité
- [x] Couleur:
  - Vert: > 90%
  - Orange: 70-90%
  - Rouge: < 70%
- [x] Badge avec nombre de bus en retard
- [x] Test visuel: couleurs correctes

**Story Points :** 3
**Priority :** Medium
**Dependencies :** US-4.2.1

**Mockup :**
```
┌─────────────────────┐
│ T1 Tempo 1          │
│ ██████████ 95% ✅   │
│ 2 retards           │
└─────────────────────┘
```

---

### Epic 4.3 : Détection Retard/Avance

#### US-4.3.1 : Coloration Bus selon État
**En tant qu'** utilisateur
**Je veux** voir les bus colorés selon leur ponctualité
**Afin d'** identifier visuellement les problèmes

**Acceptance Criteria :**
- [x] BusMarker.tsx adapte couleur selon retard
- [x] Vert: à l'heure (±3 min)
- [x] Orange: retard 3-10 min
- [x] Rouge: retard > 10 min ou avance > 5 min
- [x] Test: simuler retard, bus devient orange/rouge

**Story Points :** 3
**Priority :** Medium
**Dependencies :** US-4.2.1

---

### Epic 4.4 : Fiche Bus (Preview)

#### US-4.4.1 : Click to Open Modal
**En tant qu'** utilisateur
**Je veux** cliquer sur un bus pour voir ses détails
**Afin d'** obtenir plus d'informations

**Acceptance Criteria :**
- [x] Click sur BusMarker ouvre un modal
- [x] Modal affiche: ID bus, modèle, ligne, état
- [x] Vitesse actuelle, prochain arrêt
- [x] Bouton "Voir Jumeau Numérique" (disabled pour l'instant)
- [x] Test: click bus, modal s'ouvre

**Story Points :** 5
**Priority :** Medium
**Dependencies :** US-2.2.3

---

## 🏃 SPRINT 5 : Mode B (Dépôt) + Mode C (Déviations) (5-7 jours - 34 SP)

**Objectif :** Gestion du dépôt + Création de déviations.

### Epic 5.1 : Mode B - Dépôt

#### US-5.1.1 : Parking Registry
**En tant que** développeur
**Je veux** créer le fichier parking-registry.json
**Afin de** mapper les bus aux places OSM

**Acceptance Criteria :**
- [x] `/public/data/parking-registry.json` créé
- [x] Au moins 10 bus mappés
- [x] Structure: `{ bus_id, model, osm_way_id, depot_name, parking_spot }`
- [x] Documentation sur comment identifier les way IDs

**Story Points :** 2
**Priority :** Medium
**Dependencies :** None

---

#### US-5.1.2 : Fetch Parking Geometries
**En tant que** système
**Je veux** fetcher les polygones de parking
**Afin d'** afficher les places sur la carte

**Acceptance Criteria :**
- [x] Fonction `fetchParkingGeometries(wayIds)` dans osmFetcher.ts
- [x] Overpass query pour polygones
- [x] Conversion en GeoJSON Polygon
- [x] Cache dans localStorage
- [x] Test: 10 places fetchées

**Story Points :** 5
**Priority :** Medium
**Dependencies :** US-5.1.1, US-3.2.2

---

#### US-5.1.3 : Composant DepotMode
**En tant qu'** utilisateur
**Je veux** voir la vue dépôt
**Afin de** gérer les sorties/retours

**Acceptance Criteria :**
- [x] `src/components/modes/DepotMode.tsx` créé
- [x] Zoom auto sur le dépôt sélectionné
- [x] Affichage des polygones de parking (ParkingLayer.tsx)
- [x] Liste des bus au garage (sidebar)
- [x] Stats: total, en service, disponibles, maintenance
- [x] Test: switch vers DepotMode, carte zoom sur dépôt

**Story Points :** 8
**Priority :** Medium
**Dependencies :** US-5.1.2

**Mockup :**
```
┌────────────────┐         ┌─────────────────┐
│ Dépôt d'Essey  │         │   [CARTE ZOOM]  │
│ ────────────── │         │   Polygones     │
│ Total: 50      │         │   de parking    │
│ En service: 32 │         │   visibles      │
│ Dispo: 15      │         │                 │
│ Maint: 3       │         └─────────────────┘
└────────────────┘
```

---

#### US-5.1.4 : Bus au Garage (Positioning)
**En tant que** système
**Je veux** positionner les bus au garage
**Afin de** les afficher correctement

**Acceptance Criteria :**
- [x] Si `vehicle.state === 'GARAGE'`, positionner au centroïde du polygone
- [x] Orientation alignée sur axe du polygone
- [x] Opacité 50% pour différencier
- [x] Test: bus au garage affiché correctement

**Story Points :** 3
**Priority :** Medium
**Dependencies :** US-5.1.3

---

### Epic 5.2 : Mode C - Déviations

#### US-5.2.1 : Store Déviations
**En tant que** système
**Je veux** gérer les déviations créées
**Afin de** les persister et réutiliser

**Acceptance Criteria :**
- [x] `src/stores/useDeviationStore.ts` créé
- [x] State: `deviations: Deviation[]`
- [x] Actions: `addDeviation()`, `removeDeviation()`, `getActive()`
- [x] Persist dans localStorage
- [x] Test: créer déviation, refresh page, toujours là

**Story Points :** 3
**Priority :** High
**Dependencies :** US-1.1.1

---

#### US-5.2.2 : Composant DeviationMode
**En tant qu'** utilisateur
**Je veux** créer une déviation
**Afin de** modifier le tracé d'une ligne

**Acceptance Criteria :**
- [x] `src/components/modes/DeviationMode.tsx` créé
- [x] Sélectionner une ligne à dévier
- [x] Click sur carte pour ajouter waypoints
- [x] Waypoints s'aimantent sur routes OSM (snapping)
- [x] Afficher tracé original en gris pointillé
- [x] Afficher nouveau tracé en couleur ligne
- [x] Formulaire: nom, date début, date fin
- [x] Bouton "Enregistrer"

**Story Points :** 13
**Priority :** High
**Dependencies :** US-5.2.1

**Fonctionnalités :**
1. Mode édition activé
2. User clique waypoints
3. Snapping automatique sur routes
4. Calcul chemin entre waypoints (routing OSM ou simple line)
5. Preview en temps réel
6. Validation et save

---

#### US-5.2.3 : Application Déviation aux Bus
**En tant que** système
**Je veux** appliquer la déviation aux bus
**Afin qu'** ils suivent le nouveau tracé

**Acceptance Criteria :**
- [x] Fonction `applyDeviation(bus, virtualTime, deviations)`
- [x] Si déviation active pour la ligne, utiliser `deviationPath`
- [x] Sinon, utiliser `originalPath`
- [x] Test: créer déviation, bus la suit immédiatement

**Story Points :** 5
**Priority :** High
**Dependencies :** US-5.2.2

---

#### US-5.2.4 : Historique Déviations
**En tant qu'** utilisateur
**Je veux** voir mes déviations passées
**Afin de** les réutiliser

**Acceptance Criteria :**
- [x] Panel "Historique" dans DeviationMode
- [x] Liste des déviations créées
- [x] Boutons: Dupliquer, Éditer, Supprimer
- [x] Test: dupliquer une déviation, modif, save

**Story Points :** 5
**Priority :** Medium
**Dependencies :** US-5.2.2

---

## 🏃 SPRINT 6 : Main Courante (Logbook) (4-5 jours - 21 SP)

**Objectif :** Journal de bord complet avec auto-events et events manuels.

### Epic 6.1 : Store Logbook

#### US-6.1.1 : Zustand Store Logbook
**En tant que** système
**Je veux** gérer les entrées du logbook
**Afin de** tracer tous les événements

**Acceptance Criteria :**
- [x] `src/stores/useLogbookStore.ts` créé
- [x] State: `entries: LogbookEntry[]`
- [x] Actions: `addEntry()`, `getEntries()`, `clearOld()`
- [x] Persist dans localStorage (limite 1000 entrées)
- [x] Test: ajouter entrée, persistée

**Story Points :** 3
**Priority :** High
**Dependencies :** US-1.1.1

---

### Epic 6.2 : Auto-Events

#### US-6.2.1 : Détection Événements Automatiques
**En tant que** système
**Je veux** générer des events automatiquement
**Afin de** tracer les anomalies

**Acceptance Criteria :**
- [x] Fonction `detectEvents(vehicles, virtualTime)` appelée chaque frame
- [x] Events détectés:
  - DELAY_DETECTED (retard > 5 min)
  - EARLY_DETECTED (avance > 3 min)
  - SERVICE_START (bus passe de GARAGE à IN_SERVICE)
  - SERVICE_END (bus passe à GARAGE)
  - DEPOT_EXIT, DEPOT_ENTRY
- [x] Insertion automatique dans logbook
- [x] Test: simuler retard, event créé

**Story Points :** 8
**Priority :** High
**Dependencies :** US-6.1.1, US-4.2.1

---

### Epic 6.3 : UI Logbook

#### US-6.3.1 : Composant LogbookPanel
**En tant qu'** utilisateur
**Je veux** voir la main courante
**Afin de** suivre les événements

**Acceptance Criteria :**
- [x] `src/components/logbook/LogbookPanel.tsx` créé
- [x] Panel latéral droit (collapsible)
- [x] Liste chronologique inversée (récent en haut)
- [x] Affiche: timestamp, type, titre, description
- [x] Icônes selon type (⚠️ warning, ❌ critical, ℹ️ info)
- [x] Couleurs selon severity
- [x] Test: 10 events affichés correctement

**Story Points :** 5
**Priority :** Medium
**Dependencies :** US-6.1.1

**Mockup :**
```
┌─────────────────────────────┐
│ 📋 MAIN COURANTE            │
├─────────────────────────────┤
│ ⚠️ 14:35 - Retard détecté   │
│    Bus 101 (T1) +8 min      │
├─────────────────────────────┤
│ ℹ️ 14:30 - Sortie dépôt     │
│    Bus 205 (T3)             │
├─────────────────────────────┤
│ ❌ 14:20 - Déviation créée  │
│    Ligne 2 - Travaux        │
└─────────────────────────────┘
```

---

#### US-6.3.2 : Filtres & Recherche
**En tant qu'** utilisateur
**Je veux** filtrer les events
**Afin de** trouver rapidement l'info

**Acceptance Criteria :**
- [x] Filtres: type, ligne, bus, severity
- [x] Barre de recherche textuelle
- [x] Filtrage en temps réel
- [x] Reset filtres
- [x] Test: filtrer sur "retard", seuls events retard affichés

**Story Points :** 3
**Priority :** Medium
**Dependencies :** US-6.3.1

---

#### US-6.3.3 : Export CSV/JSON
**En tant qu'** utilisateur
**Je veux** exporter le logbook
**Afin d'** analyser les données

**Acceptance Criteria :**
- [x] Bouton "Export CSV"
- [x] Bouton "Export JSON"
- [x] Génération fichier avec toutes les entrées
- [x] Download automatique
- [x] Test: export CSV, ouvrir dans Excel

**Story Points :** 2
**Priority :** Low
**Dependencies :** US-6.3.1

---

## 🏃 SPRINT 7 : Jumeau Numérique (5-7 jours - 34 SP)

**Objectif :** Fiche détaillée du bus avec 4 onglets.

### Epic 7.1 : Modal Digital Twin

#### US-7.1.1 : Composant DigitalTwinModal
**En tant qu'** utilisateur
**Je veux** ouvrir une fiche détaillée du bus
**Afin d'** accéder à toutes les infos

**Acceptance Criteria :**
- [x] `src/components/twin/DigitalTwinModal.tsx` créé
- [x] Modal fullscreen ou large (shadcn Dialog)
- [x] Header: Numéro bus, modèle, ligne, état
- [x] 4 onglets: Télémétrie, Caméra 360, Girouette, Stats
- [x] Bouton fermer
- [x] Test: ouvrir modal, switch onglets

**Story Points :** 3
**Priority :** High
**Dependencies :** US-4.4.1

---

### Epic 7.2 : Onglet Télémétrie

#### US-7.2.1 : Simulation Télémétrie
**En tant que** système
**Je veux** simuler les données télémétrie
**Afin d'** afficher des valeurs réalistes

**Acceptance Criteria :**
- [x] `src/services/telemetrySimulator.ts` créé
- [x] Vitesse: calculée depuis delta position (km/h)
- [x] Portes: ouvertes si vitesse < 1 km/h ET proche arrêt (< 20m)
- [x] Carburant: décroit linéairement, reset à 100% au garage
- [x] Batterie: idem pour électriques
- [x] Température: aléatoire 18-22°C
- [x] Passagers: aléatoire contrôlé (0-150)
- [x] Test: données cohérentes

**Story Points :** 5
**Priority :** High
**Dependencies :** US-2.2.2

---

#### US-7.2.2 : Composant TelemetryTab
**En tant qu'** utilisateur
**Je veux** voir la télémétrie
**Afin de** connaître l'état du bus

**Acceptance Criteria :**
- [x] `src/components/twin/TelemetryTab.tsx` créé
- [x] Jauges visuelles:
  - Vitesse (gauge circulaire 0-80 km/h)
  - Carburant (barre horizontale %)
  - Température (thermomètre)
  - Passagers (pictogramme + nombre)
- [x] Indicateurs portes (ouvert/fermé)
- [x] Mise à jour temps réel (chaque seconde)
- [x] Test: jauges se mettent à jour

**Story Points :** 8
**Priority :** High
**Dependencies :** US-7.2.1

**Mockup :**
```
┌─────────────────────────────┐
│ Vitesse        Carburant    │
│   ┌───┐        ████░░ 65%   │
│  ││ 42││                     │
│   └───┘        Passagers    │
│   km/h         👤 78/150     │
│                              │
│ Portes: ✅ ✅ ❌ (A M R)     │
└─────────────────────────────┘
```

---

### Epic 7.3 : Onglet Caméra 360

#### US-7.3.1 : Composant CameraTab
**En tant qu'** utilisateur
**Je veux** voir des vidéos/photos 360
**Afin d'** explorer l'intérieur du bus

**Acceptance Criteria :**
- [x] `src/components/twin/CameraTab.tsx` créé
- [x] Player vidéo (react-player ou HTML5 video)
- [x] Sélecteur de vue: Intérieur Avant, Arrière, Ext Gauche, Ext Droite
- [x] Si vidéo équirectangulaire, contrôles panoramiques (drag)
- [x] Fallback: 4 photos statiques si pas de vidéo
- [x] Test: switch vues, vidéo/photo affichée

**Story Points :** 8
**Priority :** Medium
**Dependencies :** US-7.1.1

**Note :** Pour le MVP, utiliser photos statiques placeholder.

---

### Epic 7.4 : Onglet Girouette LED

#### US-7.4.1 : Composant GirouetteTab
**En tant qu'** utilisateur
**Je veux** voir la girouette LED
**Afin de** voir la destination affichée

**Acceptance Criteria :**
- [x] `src/components/twin/GirouetteTab.tsx` créé
- [x] Rendu CSS Grid matriciel (ex: 16x96 pixels)
- [x] Fond noir, pixels orange/jaunes
- [x] Affiche: numéro ligne (grand), destination (défilant)
- [x] Animation défilement si destination > 16 chars
- [x] Box-shadow pour effet glow
- [x] Test: animation fluide

**Story Points :** 5
**Priority :** Medium
**Dependencies :** US-7.1.1

**CSS Example :**
```css
.led-pixel {
  width: 6px;
  height: 6px;
  background: #FF9900;
  box-shadow: 0 0 10px #FF9900;
  border-radius: 1px;
}
```

---

### Epic 7.5 : Onglet Stats

#### US-7.5.1 : Composant StatsTab
**En tant qu'** utilisateur
**Je veux** voir les stats du bus
**Afin d'** analyser sa journée

**Acceptance Criteria :**
- [x] `src/components/twin/StatsTab.tsx` créé
- [x] Affiche:
  - Courses du jour
  - Km parcourus
  - Retard moyen
  - Nombre d'incidents
- [x] Graphique simple (optionnel: recharts)
- [x] Test: données affichées

**Story Points :** 5
**Priority :** Low
**Dependencies :** US-7.1.1

---

## 🏃 SPRINT 8 : Polish, Tests, Optimisation (4-5 jours - 21 SP)

**Objectif :** Finaliser l'application, corriger bugs, optimiser.

### Epic 8.1 : SVG Buses Finaux

#### US-8.1.1 : Design SVG Professionnels
**En tant que** designer
**Je veux** créer des SVG réalistes
**Afin d'** avoir un rendu professionnel

**Acceptance Criteria :**
- [x] 6 SVG créés avec Figma/Illustrator
- [x] Vue top-down détaillée
- [x] Fenêtres, portes, articulations visibles
- [x] Optimisés avec SVGO (< 5KB chacun)
- [x] Variables CSS pour couleurs
- [x] Test: rendu sur carte impeccable

**Story Points :** 8
**Priority :** Medium
**Dependencies :** US-2.2.4

---

### Epic 8.2 : Responsive Design

#### US-8.2.1 : Adaptation Mobile/Tablet
**En tant qu'** utilisateur
**Je veux** utiliser l'app sur tablette
**Afin de** l'avoir sur le terrain

**Acceptance Criteria :**
- [x] Responsive breakpoints (sm, md, lg, xl)
- [x] Sidebars collapsibles sur mobile
- [x] Touch events supportés
- [x] Carte utilisable au doigt
- [x] Test: iPad, tout fonctionne

**Story Points :** 5
**Priority :** High
**Dependencies :** All UI components

---

### Epic 8.3 : UX Improvements

#### US-8.3.1 : Loading States
**En tant qu'** utilisateur
**Je veux** voir des spinners pendant les chargements
**Afin de** savoir que ça charge

**Acceptance Criteria :**
- [x] Spinner pendant fetch GTFS
- [x] Spinner pendant fetch OSM
- [x] Skeleton loaders pour listes
- [x] Progress bar pour preload
- [x] Test: tous les chargements ont feedback

**Story Points :** 3
**Priority :** Medium
**Dependencies :** All data fetching

---

#### US-8.3.2 : Error Boundaries
**En tant que** système
**Je veux** catcher les erreurs React
**Afin d'** éviter les crashs complets

**Acceptance Criteria :**
- [x] Error Boundary composant créé
- [x] Wrapper sur <MapView>, <LogbookPanel>, etc.
- [x] UI fallback avec message d'erreur
- [x] Bouton "Recharger"
- [x] Test: throw error, boundary attrape

**Story Points :** 2
**Priority :** High
**Dependencies :** None

---

### Epic 8.4 : Performance Audit

#### US-8.4.1 : Lighthouse Audit
**En tant que** QA
**Je veux** auditer avec Lighthouse
**Afin de** valider la performance

**Acceptance Criteria :**
- [x] Lighthouse run (Performance, Accessibility, Best Practices, SEO)
- [x] Score Performance > 80
- [x] Score Accessibility > 90
- [x] Corrections des warnings
- [x] Documentation des résultats

**Story Points :** 3
**Priority :** High
**Dependencies :** All features

---

## 🏃 SPRINT 9 : Documentation + Déploiement (2-3 jours - 13 SP)

**Objectif :** Finaliser docs et déployer en production.

### Epic 9.1 : Documentation

#### US-9.1.1 : README Complet
**En tant que** développeur
**Je veux** un README clair
**Afin de** faciliter l'installation

**Acceptance Criteria :**
- [x] README.md avec sections:
  - Description projet
  - Screenshots
  - Installation (npm install, npm run dev)
  - Configuration (.env.local)
  - Architecture
  - Contribution
  - License
- [x] Badges (build status, version)
- [x] Test: suivre README, projet démarre

**Story Points :** 3
**Priority :** High
**Dependencies :** None

---

#### US-9.1.2 : Guide Utilisateur
**En tant qu'** utilisateur
**Je veux** un guide d'utilisation
**Afin de** comprendre les features

**Acceptance Criteria :**
- [x] `GUIDE_UTILISATEUR.md` créé
- [x] Sections:
  - Time Warp
  - Modes A, B, C
  - Main courante
  - Jumeau numérique
- [x] Screenshots pour chaque feature
- [x] PDF généré (optionnel)

**Story Points :** 5
**Priority :** Medium
**Dependencies :** All features

---

### Epic 9.2 : Déploiement

#### US-9.2.1 : Déploiement Vercel
**En tant que** DevOps
**Je veux** déployer sur Vercel
**Afin d'** avoir une URL publique

**Acceptance Criteria :**
- [x] Compte Vercel créé
- [x] Repository GitHub lié
- [x] Variables d'env configurées (NEXT_PUBLIC_GTFS_URL)
- [x] Build réussit
- [x] URL accessible (ex: saeiv-stan.vercel.app)
- [x] Test: app fonctionne en prod

**Story Points :** 3
**Priority :** Critical
**Dependencies :** US-9.1.1

**Steps :**
1. Push sur GitHub
2. Import project sur Vercel
3. Configure env vars
4. Deploy

---

#### US-9.2.2 : CI/CD Setup
**En tant que** DevOps
**Je veux** un pipeline CI/CD
**Afin d'** automatiser les déploiements

**Acceptance Criteria :**
- [x] GitHub Actions configuré
- [x] Workflow: build + deploy on push main
- [x] Tests automatiques (si implémentés)
- [x] Notifications Discord/Slack (optionnel)
- [x] Test: push commit, auto-deploy

**Story Points :** 2
**Priority :** Low
**Dependencies :** US-9.2.1

---

## 📊 Résumé du Backlog

### Story Points par Sprint
- Sprint 0: 8 SP
- Sprint 1: 21 SP
- Sprint 2: 34 SP
- Sprint 3: 21 SP
- Sprint 4: 21 SP
- Sprint 5: 34 SP
- Sprint 6: 21 SP
- Sprint 7: 34 SP
- Sprint 8: 21 SP
- Sprint 9: 13 SP

**Total: 228 Story Points**

### Priorités
- **Critical:** 20 User Stories (features bloquantes)
- **High:** 25 User Stories (importantes)
- **Medium:** 18 User Stories (nice to have)
- **Low:** 5 User Stories (bonus)

### Dépendances Critiques
1. Setup → Types → Stores
2. Types → Parsing GTFS → Position Solver
3. Position Solver → Worker → Multi-Segments
4. Multi-Segments → LOD → Viewport Culling
5. Tous les stores → Features avancées

---

## 🎯 Définition of Done (DoD)

Une User Story est "Done" si :
- [ ] Code écrit et testé manuellement
- [ ] Pas d'erreurs TypeScript (`tsc --noEmit`)
- [ ] Pas de console.error en production
- [ ] Fonctionne sur Chrome/Firefox/Safari
- [ ] Responsive (desktop + tablet si applicable)
- [ ] Code commenté (parties complexes)
- [ ] Commit Git avec message clair
- [ ] Acceptance Criteria tous validés

---

## 📝 Conventions

### Commits
- `feat: description` - Nouvelle feature
- `fix: description` - Correction bug
- `refactor: description` - Refactoring
- `docs: description` - Documentation
- `style: description` - Style/formatting
- `test: description` - Tests

### Branches
- `main` - Production
- `develop` - Développement
- `feature/US-X.X.X` - Feature branches

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Functional components (React)
- Custom hooks pour logique réutilisable

---

## 🚀 Prêt pour le Développement !

Ce backlog couvre l'intégralité du projet SAEIV Stan v2.0. Il sera suivi rigoureusement et mis à jour au fur et à mesure de l'avancement.

**Next Step:** Commencer Sprint 0 - Setup & Infrastructure

**Status:** ✅ Backlog Complet - Prêt à Coder
