# 📘 SPECS - SAEIV Client-Side v2.0 (Nancy - Stan)

## 1. Vision du Projet

Développement d'un **SAEIV (Système d'Aide à l'Exploitation et à l'Information Voyageurs)** pour le réseau Stan (Nancy) orienté "Portfolio Technique Démonstratif".

### Objectifs
* **Architecture :** "Full Client-Side" (Serverless). Pas de Backend, pas de Firebase.
* **Moteur :** Le navigateur effectue tous les calculs de géolocalisation et d'interpolation en temps réel.
* **Données :** OpenStreetMap (Routes & Parking) + GTFS (Horaires théoriques).
* **Rendu :** Visualisation haute-fidélité des véhicules (Bi-articulation fluide).
* **Accessibilité :** Application publique (pas d'authentification).
* **Échelle :** Simulation de ~300 véhicules simultanés avec performance adaptative.

---

## 2. Stack Technique

### 2.1 Core Framework
* **Next.js 14+** (App Router) - SSG pour les pages statiques
* **React 18+** - UI Components
* **TypeScript 5+** - Type safety

### 2.2 State Management
* **Zustand** - State global (crucial pour gérer la boucle de temps performante sans re-render inutiles)
  - `useTimeStore` : Temps virtuel, speed factor
  - `useFleetStore` : État des véhicules
  - `useMapStore` : Géométries OSM, cache
  - `useLogbookStore` : Main courante

### 2.3 Cartographie & Géospatial
* **React-Leaflet** - Composants carte
* **Leaflet** - Core mapping
* **Turf.js** (@turf/turf) - Interpolation sur ligne, calculs de distance, bearings
* **osmtogeojson** - Conversion Overpass XML → GeoJSON
* **rbush** - Index spatial pour optimisation viewport

### 2.4 Data Fetching & Parsing
* **query-overpass** - Récupération géométries OSM
* **gtfs-realtime-bindings** (optionnel pour évolution future)
* Parser GTFS custom (stops.txt, routes.txt, trips.txt, stop_times.txt, shapes.txt)

### 2.5 Performance
* **Web Workers** - Déporter calculs turf.js
* **RequestAnimationFrame** - Boucle de rendu 60 FPS
* **Virtualisation** - Render uniquement viewport visible

### 2.6 Persistance
* **localStorage** - Sauvegarder :
  - Configurations utilisateur
  - Main courante (avec limite temporelle)
  - Historique des déviations
  - Cache géométries OSM (7 jours)

### 2.7 UI/UX
* **Tailwind CSS** - Styling
* **Shadcn/ui** - Composants UI réutilisables
* **Lucide React** - Icônes
* **React Player** (ou similaire) - Vidéos 360°

---

## 3. Sources de Données

### 3.1 GTFS Stan Nancy
**Source :** https://transport.data.gouv.fr/ (rechercher "Stan Nancy")

**Fichiers requis :**
- `stops.txt` - Liste des arrêts
- `routes.txt` - Lignes de bus
- `trips.txt` - Courses
- `stop_times.txt` - Horaires de passage
- `shapes.txt` - Tracés théoriques (optionnel si on utilise OSM)

**Stockage :**
- Fichiers statiques dans `/public/data/gtfs/`
- Parsing au build-time avec script Node.js
- Export en JSON optimisé pour le runtime

**Fréquence de mise à jour :**
- Mensuelle (via CI/CD ou manuel)

### 3.2 OpenStreetMap Relations

**Mapping Routes :** Créer un fichier de configuration manuel
```json
// config/osm-routes-mapping.json
{
  "routes": [
    {
      "gtfs_route_id": "R1",
      "route_short_name": "1",
      "osm_relation_id": 123456,
      "color": "#E30613",
      "preload": true
    },
    {
      "gtfs_route_id": "R2",
      "route_short_name": "2",
      "osm_relation_id": 234567,
      "color": "#0072BC",
      "preload": true
    }
  ]
}
```

**Récupération :**
```typescript
// Overpass Query Example
const query = `
[out:json];
relation(${relationId});
(._;>;);
out geom;
`;
```

**Cache Strategy (Hybride) :**
1. **Au chargement initial :** Télécharger les 5-10 lignes principales (flag `preload: true`)
2. **Lazy-loading :** Lignes secondaires chargées à la demande
3. **Persistance :** localStorage avec hash de version (invalidation auto après 7 jours)
4. **Fallback :** Si Overpass échoue, utiliser géométries statiques de secours dans `/public/data/fallback/`

### 3.3 Parking Registry

**Fichier de configuration :**
```json
// data/parking-registry.json
[
  {
    "bus_id": "101",
    "model": "HESS_LIGHTRAM_25",
    "osm_way_id": 987654,
    "depot_name": "Dépôt d'Essey",
    "parking_spot": "A-12"
  },
  {
    "bus_id": "102",
    "model": "STANDARD",
    "osm_way_id": 987655,
    "depot_name": "Dépôt d'Essey",
    "parking_spot": "A-13"
  }
]
```

**Récupération OSM :**
- Au démarrage, fetch des polygones via Overpass
- Stockage des géométries en cache

---

## 4. Fonctionnalités Majeures

### 4.1 Moteur Temporel (Time Warp) ⏱️

L'utilisateur contrôle le temps via un player en bas d'écran.

**Contrôles :**
- ⏸️ Pause
- ▶️ Lecture normale (x1)
- ⏩ Avance rapide : x2, x5, x10, x30, x60, x100

**Logique :**
```typescript
interface TimeState {
  virtualTimestamp: number; // Unix timestamp en ms
  speedFactor: number; // 1, 2, 10, 100...
  isPaused: boolean;
  realStartTime: number; // Pour synchronisation
}

// Dans la boucle RAF
function updateTime(delta: number) {
  if (!isPaused) {
    virtualTimestamp += delta * speedFactor;
  }
}
```

**Features additionnelles :**
- Sélecteur de date/heure (jump to specific time)
- Mode "Heure Réelle" (sync avec horloge système)
- Indicateur visuel de la vitesse active

---

### 4.2 Moteur de Rendu "Multi-Segments" (Bi-Articulation) 🐛

Les bus ne sont pas de simples icônes. Ils respectent la physique du modèle (Standard, Articulé, Bi-articulé).

**Méthode de rendu :**
1. Calculer la position de la **Tête** du bus sur la ligne OSM (distance parcourue)
2. Calculer la position de la **Remorque 1** à `distance - offset1`
3. Calculer la position de la **Remorque 2** à `distance - offset2`
4. Chaque segment s'oriente (bearing) indépendamment selon la courbure de la route à son point précis

**Résultat :** Dans les virages, le bus se "plie" réalistement en suivant le tracé exact.

**Optimisation (LOD - Level of Detail) :**

Adaptation automatique selon :
- Performance du device (détection GPU/CPU via benchmarks)
- Nombre de véhicules visibles
- Niveau de zoom de la carte

**Niveaux de détail :**
- **Zoom < 13** : Icône simple (1 marker par bus, forme rectangulaire colorée)
- **Zoom 13-15** : Rendu bi-segment (tête + queue uniquement pour articulés)
- **Zoom > 15** : Rendu tri-segment complet (bi-articulation full)

**Performance Optimizations :**
- **Viewport Culling :** Ne calculer que les bus visibles + marge de 10%
- **Update Throttling :** Buses hors écran → mise à jour à 2 FPS au lieu de 60 FPS
- **Web Worker :** Tous les calculs turf.js déportés dans `positionWorker.ts`
- **Object Pooling :** Réutilisation des markers Leaflet au lieu de create/destroy

---

### 4.3 Parking Connecté OSM 🅿️

Les bus hors service ne disparaissent pas, ils se garent.

**Lien Donnée :**
- Chaque bus possède un `osmParkingWayId` (ID du polygone de sa place de parking sur OpenStreetMap)

**Initialisation :**
- Au chargement, l'app récupère les géométries de ces places via Overpass API
- Stockage en cache pour éviter refetch

**États du véhicule :**
```typescript
type VehicleState =
  | 'IN_SERVICE'    // En ligne, suit GTFS trip
  | 'GARAGE'        // Au dépôt, positionné sur parking OSM
  | 'DEADHEAD'      // Haut-le-pied (vers dépôt ou prise service)
  | 'MAINTENANCE';  // Immobilisé (clé à molette sur le marker)
```

**Rendu :**
- Si `state === 'GARAGE'`, positionner au centroïde du polygone OSM
- Orientation alignée sur l'axe principal du polygone
- Opacité réduite (50%) pour différencier des actifs

---

### 4.4 Modes d'Exploitation

#### Mode A : Régulation 📊

**Vue :** Carte centrée sur le réseau, sidebar filtres + KPI

**Features :**
1. **Filtrage par ligne** - Multi-select, affichage des bus de la/des ligne(s)
2. **Thermomètre de ligne** - Indicateur visuel de ponctualité
   ```typescript
   interface LineHealth {
     lineId: string;
     punctuality: number; // % de courses à l'heure (±3 min)
     status: 'good' | 'warning' | 'critical'; // >90% / 70-90% / <70%
   }
   ```
3. **Détection retard/avance** - Mise en évidence visuelle
   - Vert : À l'heure (±3 min)
   - Orange : Retard 3-10 min
   - Rouge : Retard >10 min ou avance >5 min
4. **Fiche bus au clic** - Ouvre le jumeau numérique (voir 4.6)

#### Mode B : Dépôt 🏢

**Vue :** Zoom automatique sur le dépôt sélectionné

**Features :**
1. **Vue plan du dépôt** - Affichage des places de parking OSM
2. **Gestion des sorties** - Timeline des départs/retours théoriques
3. **État des véhicules** - Couleur selon état (service, maintenance, disponible)
4. **Statistiques** - Taux d'occupation, buses disponibles

**UI :**
```typescript
interface DepotView {
  depotId: string;
  name: string;
  capacity: number;
  vehicles: {
    total: number;
    in_service: number;
    available: number;
    maintenance: number;
  };
  nextDepartures: Array<{
    busId: string;
    time: string;
    lineId: string;
  }>;
}
```

#### Mode C : Méthodes (Déviations) 🛠️

**Vue :** Carte en mode édition

**Features :**
1. **Créer une déviation** :
   - Sélectionner une ligne concernée
   - Cliquer sur la carte pour ajouter des waypoints magnétiques (snapping sur routes OSM)
   - Définir début/fin de validité temporelle
   - Nommer la déviation (ex: "Travaux Rue Saint-Dizier")

2. **Snapping intelligent** :
   - Points cliqués s'aimantent automatiquement sur les routes OSM les plus proches
   - Calcul du chemin optimal entre waypoints via routing OSM

3. **Persistance locale** :
   ```typescript
   interface Deviation {
     id: string;
     name: string;
     lineId: string;
     originalPath: GeoJSON.LineString;
     deviationPath: GeoJSON.LineString;
     validFrom: string; // ISO date
     validTo: string;
     createdAt: string;
   }
   ```
   - Stockage dans localStorage
   - Historique consultable (liste des déviations créées)
   - Réutilisation (dupliquer/éditer une déviation existante)

4. **Application** :
   - Les bus de la ligne déviée suivent le nouveau tracé pendant la période de validité
   - Affichage visuel du tracé original en pointillés gris + nouveau en couleur ligne

---

### 4.5 Main Courante (Logbook) 📋

**Définition :** Journal de bord numérique et centralisé de l'exploitation. Liste chronologique traçant tous les événements du réseau.

**Types d'événements :**

#### A. Événements Automatiques (générés par le système)
```typescript
type AutoEvent =
  | 'SERVICE_START'      // Bus prend son service
  | 'SERVICE_END'        // Bus termine son service
  | 'DEPOT_EXIT'         // Sortie du dépôt
  | 'DEPOT_ENTRY'        // Retour au dépôt
  | 'DELAY_DETECTED'     // Retard >5 min détecté
  | 'EARLY_DETECTED'     // Avance >3 min détectée
  | 'OFF_ROUTE'          // Écart >50m du tracé théorique
  | 'TECH_ALARM';        // Alarme technique (simulation)
```

#### B. Événements Manuels (saisis par l'utilisateur)
```typescript
type ManualEvent =
  | 'INCIDENT'           // Déclaration incident
  | 'REGULATION_ACTION'  // Action de régulation
  | 'DEVIATION_CREATED'  // Mise en place déviation
  | 'NOTE';              // Note libre
```

**Structure de données :**
```typescript
interface LogbookEntry {
  id: string;
  timestamp: number; // Unix ms
  virtualTimestamp: number; // Temps virtuel de l'event
  type: AutoEvent | ManualEvent;
  severity: 'info' | 'warning' | 'critical';

  // Contexte
  busId?: string;
  lineId?: string;
  location?: GeoJSON.Point;

  // Détails
  title: string;
  description?: string;
  metadata?: Record<string, any>; // Données spécifiques

  // Meta
  isAutomatic: boolean;
  userId?: string; // Pour évolution future
}
```

**UI Component :**
- Panel latéral déroulant avec liste chronologique inversée (plus récent en haut)
- Filtres : type, ligne, bus, niveau de sévérité
- Recherche textuelle
- Export CSV/JSON pour analyse

**Persistance :**
- localStorage avec limite (ex: dernières 1000 entrées ou derniers 7 jours)
- Compression JSON pour économiser espace

**Exemples d'entrées :**
```json
[
  {
    "id": "log_001",
    "timestamp": 1704398400000,
    "virtualTimestamp": 1704395800000,
    "type": "DELAY_DETECTED",
    "severity": "warning",
    "busId": "101",
    "lineId": "1",
    "title": "Retard détecté : Bus 101 (Ligne 1)",
    "description": "Retard de 8 minutes sur course 1234",
    "isAutomatic": true
  },
  {
    "id": "log_002",
    "timestamp": 1704398500000,
    "virtualTimestamp": 1704395900000,
    "type": "DEVIATION_CREATED",
    "severity": "info",
    "lineId": "3",
    "title": "Déviation activée : Travaux Rue Saint-Dizier",
    "description": "Ligne 3 déviée, durée estimée 2h",
    "isAutomatic": false,
    "metadata": {
      "deviationId": "dev_001"
    }
  }
]
```

---

### 4.6 Fiche Jumeau Numérique (Digital Twin Panel) 🚌

**Ouverture :** Clic sur un bus sur la carte

**Layout :** Modal/Panel latéral avec onglets

#### Onglet 1 : Vue d'ensemble
- **En-tête :**
  - Numéro de bus (ex: "Bus 101")
  - Modèle (ex: "Hess Lightram 25")
  - État actuel (En service / Au garage)
  - Ligne actuelle (si en service)

- **Télémétrie temps réel (simulée) :**
  ```typescript
  interface VehicleTelemetry {
    // Calculé depuis position
    speed: number; // km/h (delta de position)
    heading: number; // degrés

    // Simulé intelligent
    doors: {
      front: boolean;
      middle: boolean;
      rear: boolean;
    }; // Ouvertes si vitesse < 1 km/h ET proche arrêt

    // Simulé basique
    fuelLevel: number; // % (décroit linéairement, reset à 100% au retour garage)
    batteryLevel: number; // % (pour électriques)
    temperature: number; // °C intérieur
    passengerCount: number; // Estimation aléatoire contrôlée
  }
  ```

- **Jauges visuelles :**
  - Vitesse (gauge circulaire, 0-80 km/h)
  - Carburant (barre horizontale)
  - Température (thermomètre)
  - Passagers (pictogramme + nombre)

#### Onglet 2 : Caméra 360°
- **Player vidéo équirectangulaire** (format YouTube 360)
- **Contrôles panoramiques** - Drag to rotate
- **Vues disponibles :**
  - Intérieur Avant (poste de conduite)
  - Intérieur Arrière (vue passagers)
  - Extérieur Gauche
  - Extérieur Droite
- **Note :** Vidéos pré-enregistrées, lecture libre (pas de sync temps réel)
- **Fallback :** Si pas de vidéo, afficher 4 photos statiques

#### Onglet 3 : Girouette LED
- **Rendu CSS Grid** - Simulation d'affichage LED matriciel
- **Données affichées :**
  - Numéro de ligne (grande taille)
  - Destination (défilant si >16 caractères)
  - Pictogrammes (PMR, Vélo, etc.)
- **Styles :**
  - Fond noir
  - Pixels orange/jaunes (box-shadow glow effect)
  - Animation de défilement

```typescript
interface Destination {
  lineNumber: string;
  destinationName: string;
  via?: string[];
  color: string; // Couleur de la ligne
  pictograms: Array<'pmr' | 'bike' | 'wifi'>;
}
```

#### Onglet 4 : Historique / Stats
- Courses du jour
- Km parcourus
- Retards moyens
- Incidents enregistrés

---

## 5. Modèle de Données (TypeScript)

### 5.1 Vehicle Models

```typescript
// src/types/vehicle-model.ts

export type BusType = 'STANDARD' | 'ARTICULATED' | 'BI_ARTICULATED';

export interface BusSegment {
  id: 'head' | 'trailer1' | 'trailer2';
  length: number; // mètres
  spriteUrl: string; // URL du SVG (à créer)
  offset: number; // Distance par rapport à l'avant du bus
}

export interface BusModelStats {
  id: string;
  name: string;
  type: BusType;
  totalLength: number; // mètres
  width: number; // mètres
  segments: BusSegment[];
  capacity: {
    seated: number;
    standing: number;
  };
  propulsion: 'diesel' | 'electric' | 'hybrid';
}

// Exemples de modèles

export const STANDARD_12M: BusModelStats = {
  id: 'standard_12m',
  name: 'Bus Standard 12m',
  type: 'STANDARD',
  totalLength: 12,
  width: 2.5,
  segments: [
    {
      id: 'head',
      length: 12,
      spriteUrl: '/assets/bus/standard-12m.svg',
      offset: 0
    }
  ],
  capacity: { seated: 30, standing: 50 },
  propulsion: 'diesel'
};

export const ARTICULATED_18M: BusModelStats = {
  id: 'articulated_18m',
  name: 'Bus Articulé 18m',
  type: 'ARTICULATED',
  totalLength: 18,
  width: 2.5,
  segments: [
    {
      id: 'head',
      length: 10,
      spriteUrl: '/assets/bus/articulated-head.svg',
      offset: 0
    },
    {
      id: 'trailer1',
      length: 8,
      spriteUrl: '/assets/bus/articulated-tail.svg',
      offset: 10.5
    }
  ],
  capacity: { seated: 45, standing: 95 },
  propulsion: 'diesel'
};

export const HESS_LIGHTRAM_25: BusModelStats = {
  id: 'hess_lightram_25',
  name: 'Hess Lightram 25 (Bi-articulé)',
  type: 'BI_ARTICULATED',
  totalLength: 24.7,
  width: 2.55,
  segments: [
    {
      id: 'head',
      length: 8.2,
      spriteUrl: '/assets/bus/hess-head.svg',
      offset: 0
    },
    {
      id: 'trailer1',
      length: 8.2,
      spriteUrl: '/assets/bus/hess-middle.svg',
      offset: 8.7
    },
    {
      id: 'trailer2',
      length: 8.3,
      spriteUrl: '/assets/bus/hess-tail.svg',
      offset: 17.4
    }
  ],
  capacity: { seated: 56, standing: 99 },
  propulsion: 'electric'
};

export const BUS_MODELS: Record<string, BusModelStats> = {
  'standard_12m': STANDARD_12M,
  'articulated_18m': ARTICULATED_18M,
  'hess_lightram_25': HESS_LIGHTRAM_25
};
```

### 5.2 Fleet & Vehicles

```typescript
// src/types/fleet.ts

export type VehicleState =
  | 'IN_SERVICE'
  | 'GARAGE'
  | 'DEADHEAD'
  | 'MAINTENANCE';

export interface BusInstance {
  id: string; // ex: "101"
  modelId: string; // ref vers BusModelStats
  osmParkingWayId: number; // ID OpenStreetMap de la place de parking

  // Affectation théorique
  gtfsTripId?: string; // Course GTFS en cours
  currentRoute?: string; // Ligne en cours

  // État opérationnel
  state: VehicleState;

  // Position calculée (mise à jour par le solver)
  position?: {
    segments: Array<{
      lat: number;
      lng: number;
      bearing: number; // degrés
    }>;
    speed: number; // km/h
    nextStop?: string; // ID du prochain arrêt
  };

  // Télémétrie simulée
  telemetry?: VehicleTelemetry;
}

export interface Fleet {
  vehicles: BusInstance[];
  lastUpdate: number; // timestamp
}
```

### 5.3 GTFS Types

```typescript
// src/types/gtfs.ts

export interface GTFSStop {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  stop_code?: string;
}

export interface GTFSRoute {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_type: number;
  route_color?: string;
}

export interface GTFSTrip {
  trip_id: string;
  route_id: string;
  service_id: string;
  trip_headsign?: string;
  direction_id: 0 | 1;
  shape_id?: string;
}

export interface GTFSStopTime {
  trip_id: string;
  stop_id: string;
  arrival_time: string; // HH:MM:SS
  departure_time: string;
  stop_sequence: number;
}

export interface GTFSShape {
  shape_id: string;
  shape_pt_lat: number;
  shape_pt_lon: number;
  shape_pt_sequence: number;
}
```

### 5.4 OSM Types

```typescript
// src/types/osm.ts

export interface OSMRouteConfig {
  gtfs_route_id: string;
  route_short_name: string;
  osm_relation_id: number;
  color: string;
  preload: boolean; // Charger au démarrage ?
}

export interface OSMGeometry {
  relationId: number;
  geometry: GeoJSON.LineString;
  fetchedAt: number; // timestamp
  version: string; // hash pour invalidation cache
}

export interface ParkingSpot {
  bus_id: string;
  model: string;
  osm_way_id: number;
  depot_name: string;
  parking_spot: string;
  geometry?: GeoJSON.Polygon;
}
```

---

## 6. Algorithme de Positionnement (La Boucle Critique)

### 6.1 Architecture générale

```
┌─────────────────────────────────────────────┐
│         Main Thread (React)                 │
│  ┌────────────────────────────────────┐     │
│  │  requestAnimationFrame Loop        │     │
│  │  - Update virtualTime              │     │
│  │  - Send work to Worker             │     │
│  │  - Receive positions               │     │
│  │  - Update Zustand store            │     │
│  │  - Leaflet re-renders markers      │     │
│  └────────────────────────────────────┘     │
└─────────────────────────────────────────────┘
                    ↕️ (postMessage)
┌─────────────────────────────────────────────┐
│      Web Worker (positionWorker.ts)         │
│  ┌────────────────────────────────────┐     │
│  │  For each active bus:              │     │
│  │  1. Find GTFS segment              │     │
│  │  2. Calc temporal progress %       │     │
│  │  3. Calc distance on OSM line      │     │
│  │  4. turf.along() for each segment  │     │
│  │  5. turf.bearing() for rotation    │     │
│  └────────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

### 6.2 Boucle RAF (Main Thread)

```typescript
// src/hooks/useAnimationLoop.ts

let animationFrameId: number;
let lastTimestamp = 0;

export function useAnimationLoop() {
  const { virtualTimestamp, speedFactor, isPaused, updateTime } = useTimeStore();
  const { vehicles } = useFleetStore();
  const workerRef = useRef<Worker>();

  useEffect(() => {
    // Initialize worker
    workerRef.current = new Worker(
      new URL('../workers/positionWorker.ts', import.meta.url)
    );

    workerRef.current.onmessage = (e) => {
      const { positions } = e.data;
      // Update store avec nouvelles positions
      useFleetStore.getState().updatePositions(positions);
    };

    return () => workerRef.current?.terminate();
  }, []);

  const loop = (timestamp: number) => {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (!isPaused) {
      // Update virtual time
      updateTime(deltaTime);

      // Send calculation request to worker
      workerRef.current?.postMessage({
        virtualTimestamp: virtualTimestamp + deltaTime * speedFactor,
        vehicles: vehicles.filter(v => v.state === 'IN_SERVICE'),
        // ... OSM geometries, GTFS data
      });
    }

    animationFrameId = requestAnimationFrame(loop);
  };

  useEffect(() => {
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, speedFactor]);
}
```

### 6.3 Position Solver (Web Worker)

```typescript
// src/workers/positionWorker.ts

import * as turf from '@turf/turf';

interface WorkerInput {
  virtualTimestamp: number;
  vehicles: BusInstance[];
  osmGeometries: Map<string, GeoJSON.LineString>;
  gtfsStopTimes: GTFSStopTime[];
}

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const { virtualTimestamp, vehicles, osmGeometries, gtfsStopTimes } = e.data;

  const positions = vehicles.map(bus => {
    return calculateBusPosition(bus, virtualTimestamp, osmGeometries, gtfsStopTimes);
  });

  self.postMessage({ positions });
};

function calculateBusPosition(
  bus: BusInstance,
  virtualTime: number,
  geometries: Map<string, GeoJSON.LineString>,
  stopTimes: GTFSStopTime[]
): BusPosition {

  // STEP 1: Trouver le segment GTFS actif
  const currentSegment = findActiveGTFSSegment(bus.gtfsTripId, virtualTime, stopTimes);
  if (!currentSegment) {
    return null; // Bus pas en service à cette heure
  }

  // STEP 2: Calculer progression temporelle (%)
  const { stopA, stopB, departureTime, arrivalTime } = currentSegment;
  const segmentDuration = arrivalTime - departureTime;
  const elapsedTime = virtualTime - departureTime;
  const progress = Math.min(1, Math.max(0, elapsedTime / segmentDuration));

  // STEP 3: Récupérer la géométrie OSM du segment
  const routeLine = geometries.get(bus.currentRoute);
  if (!routeLine) return null;

  // STEP 4: Convertir % temporel en distance métrique
  const totalDistance = turf.length(routeLine, { units: 'meters' });

  // Trouver distance de stopA et stopB sur la ligne
  const stopAPoint = turf.point([stopA.stop_lon, stopA.stop_lat]);
  const stopBPoint = turf.point([stopB.stop_lon, stopB.stop_lat]);

  const distStopA = findDistanceAlongLine(routeLine, stopAPoint);
  const distStopB = findDistanceAlongLine(routeLine, stopBPoint);

  // Interpoler
  const distHead = distStopA + (distStopB - distStopA) * progress;

  // STEP 5: Calculer positions de chaque segment du bus
  const model = BUS_MODELS[bus.modelId];
  const segments = model.segments.map(segment => {
    const segmentDist = Math.max(0, distHead - segment.offset);
    const point = turf.along(routeLine, segmentDist, { units: 'meters' });

    // Calculer bearing (orientation)
    const nextPoint = turf.along(routeLine, segmentDist + 1, { units: 'meters' });
    const bearing = turf.bearing(point, nextPoint);

    return {
      lat: point.geometry.coordinates[1],
      lng: point.geometry.coordinates[0],
      bearing: bearing
    };
  });

  // STEP 6: Calculer vitesse (dérivée de distance)
  const speed = calculateSpeed(distHead, bus.previousDistance, deltaTime);

  return {
    busId: bus.id,
    segments,
    speed,
    nextStop: stopB.stop_id
  };
}

function findDistanceAlongLine(
  line: GeoJSON.LineString,
  point: GeoJSON.Point
): number {
  // Trouver le point le plus proche sur la ligne
  const snapped = turf.nearestPointOnLine(line, point);

  // Calculer distance depuis le début de la ligne
  const start = turf.point(line.coordinates[0]);
  return turf.distance(start, snapped, { units: 'meters' });
}
```

### 6.4 Optimisations Critiques

**A. Viewport Culling**
```typescript
function filterVisibleBuses(
  buses: BusInstance[],
  mapBounds: L.LatLngBounds
): BusInstance[] {
  // Agrandir bounds de 10% pour marge
  const expandedBounds = mapBounds.pad(0.1);

  return buses.filter(bus => {
    if (!bus.position) return false;
    const headPos = bus.position.segments[0];
    return expandedBounds.contains([headPos.lat, headPos.lng]);
  });
}
```

**B. Update Throttling**
```typescript
// Buses hors écran : update à 2 FPS au lieu de 60 FPS
const updateInterval = isVisible ? 0 : 500; // ms

if (Date.now() - lastUpdate > updateInterval) {
  calculatePosition(bus);
  lastUpdate = Date.now();
}
```

**C. Spatial Index (RBush)**
```typescript
import RBush from 'rbush';

const busIndex = new RBush();

// Insertion
busIndex.insert({
  minX: lng,
  minY: lat,
  maxX: lng,
  maxY: lat,
  bus: busInstance
});

// Query viewport
const visibleBuses = busIndex.search({
  minX: bounds.getWest(),
  minY: bounds.getSouth(),
  maxX: bounds.getEast(),
  maxY: bounds.getNorth()
});
```

---

## 7. Structure du Projet

```
saeiv-stan/
├── public/
│   ├── assets/
│   │   ├── bus/                    # SVG des bus (à créer)
│   │   │   ├── standard-12m.svg
│   │   │   ├── articulated-head.svg
│   │   │   ├── articulated-tail.svg
│   │   │   ├── hess-head.svg
│   │   │   ├── hess-middle.svg
│   │   │   └── hess-tail.svg
│   │   └── videos/                 # Vidéos 360° (optionnel)
│   │       └── interior-front.mp4
│   ├── data/
│   │   ├── gtfs/                   # Données GTFS statiques
│   │   │   ├── stops.txt
│   │   │   ├── routes.txt
│   │   │   ├── trips.txt
│   │   │   ├── stop_times.txt
│   │   │   └── shapes.txt
│   │   ├── parking-registry.json   # Mapping bus -> parking OSM
│   │   └── fallback/               # Géométries OSM de secours
│   │       ├── route_1.geojson
│   │       └── route_2.geojson
│   └── config/
│       └── osm-routes-mapping.json # Mapping GTFS -> OSM Relations
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Page principale
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── map/
│   │   │   ├── MapView.tsx         # Composant Leaflet principal
│   │   │   ├── BusMarker.tsx       # Marker multi-segments
│   │   │   ├── ParkingLayer.tsx    # Affichage parkings
│   │   │   └── DeviationLayer.tsx  # Tracés déviations
│   │   ├── timeline/
│   │   │   ├── TimeController.tsx  # Player temporel
│   │   │   └── SpeedSelector.tsx   # x1, x10, x100...
│   │   ├── modes/
│   │   │   ├── RegulationMode.tsx  # Mode A
│   │   │   ├── DepotMode.tsx       # Mode B
│   │   │   └── DeviationMode.tsx   # Mode C
│   │   ├── logbook/
│   │   │   ├── LogbookPanel.tsx    # Main courante
│   │   │   └── LogEntry.tsx        # Entrée individuelle
│   │   ├── twin/
│   │   │   ├── DigitalTwinModal.tsx # Fiche jumeau numérique
│   │   │   ├── TelemetryTab.tsx
│   │   │   ├── CameraTab.tsx
│   │   │   ├── GirouetteTab.tsx
│   │   │   └── StatsTab.tsx
│   │   └── ui/                     # Shadcn components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── ...
│   │
│   ├── stores/                     # Zustand stores
│   │   ├── useTimeStore.ts         # Temps virtuel
│   │   ├── useFleetStore.ts        # État flotte
│   │   ├── useMapStore.ts          # Géométries OSM
│   │   ├── useLogbookStore.ts      # Main courante
│   │   └── useDeviationStore.ts    # Déviations
│   │
│   ├── services/
│   │   ├── gtfsParser.ts           # Parse fichiers GTFS
│   │   ├── osmFetcher.ts           # Fetch Overpass API
│   │   ├── cacheManager.ts         # Gestion localStorage
│   │   └── telemetrySimulator.ts   # Simulation données
│   │
│   ├── workers/
│   │   └── positionWorker.ts       # Calculs positions
│   │
│   ├── hooks/
│   │   ├── useAnimationLoop.ts     # Boucle RAF
│   │   ├── useBusPosition.ts       # Hook position bus
│   │   └── useViewportCulling.ts   # Optimisation viewport
│   │
│   ├── types/
│   │   ├── vehicle-model.ts        # Modèles de bus
│   │   ├── fleet.ts                # Instances véhicules
│   │   ├── gtfs.ts                 # Types GTFS
│   │   ├── osm.ts                  # Types OSM
│   │   ├── logbook.ts              # Main courante
│   │   └── deviation.ts            # Déviations
│   │
│   ├── lib/
│   │   ├── utils.ts                # Utilitaires généraux
│   │   └── constants.ts            # Constantes (couleurs, etc.)
│   │
│   └── scripts/                    # Scripts build-time
│       ├── parseGTFS.ts            # Prétraitement GTFS
│       └── fetchOSMFallback.ts     # DL géométries secours
│
├── .env.local                      # Variables d'environnement
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 8. Plan de Développement

### Phase 1 : Fondations (Semaine 1-2)
**Objectif :** Infrastructure de base + 1 bus test

- [ ] Setup Next.js + TypeScript + Tailwind + Shadcn
- [ ] Zustand stores (Time, Fleet, Map)
- [ ] Types TypeScript (vehicle-model, fleet, gtfs, osm)
- [ ] Parser GTFS (1 ligne test)
- [ ] Service OSM Fetcher (fetch 1 relation)
- [ ] Composant MapView (React-Leaflet basique)
- [ ] Time Controller UI (pause/play/speed)
- [ ] Hook useAnimationLoop (RAF simple, sans worker)
- [ ] Rendu 1 bus STANDARD (icône simple, pas articulation)
- [ ] Test : Bus se déplace sur 1 ligne selon GTFS

### Phase 2 : Rendu Avancé (Semaine 3-4)
**Objectif :** Multi-segments + Performance

- [ ] Web Worker (positionWorker.ts)
- [ ] Algorithme position solver complet (turf.along + bearing)
- [ ] Composant BusMarker multi-segments
- [ ] SVG placeholder pour bus (rectangles colorés)
- [ ] Modèles ARTICULATED et BI_ARTICULATED
- [ ] LOD adaptatif (zoom-based rendering)
- [ ] Viewport culling (RBush)
- [ ] Test : 50 bus simultanés à 60 FPS

### Phase 3 : Données Complètes (Semaine 5)
**Objectif :** Scaling données

- [ ] Récupération GTFS Stan complet
- [ ] Mapping OSM Relations (toutes les lignes)
- [ ] Parking Registry (300 véhicules)
- [ ] Cache OSM hybride (preload + lazy)
- [ ] Fallback statique (géométries secours)
- [ ] Script parseGTFS.ts (optimisation build-time)
- [ ] Test : 300 bus, chargement < 10s

### Phase 4 : Modes d'Exploitation (Semaine 6-7)
**Objectif :** Features métier

- [ ] Mode A : Régulation
  - [ ] Filtrage par ligne
  - [ ] Thermomètre ponctualité
  - [ ] Détection retard/avance
- [ ] Mode B : Dépôt
  - [ ] Vue parkings OSM
  - [ ] Timeline sorties/retours
  - [ ] Stats dépôt
- [ ] Mode C : Déviations
  - [ ] UI création déviation
  - [ ] Snapping OSM
  - [ ] Persistance localStorage
  - [ ] Historique réutilisable
- [ ] Test : Créer déviation, voir bus la suivre

### Phase 5 : Main Courante (Semaine 8)
**Objectif :** Logbook fonctionnel

- [ ] Store useLogbookStore
- [ ] Auto-events (retards, sorties dépôt, etc.)
- [ ] Composant LogbookPanel
- [ ] Filtres + recherche
- [ ] Persistance localStorage (limite 1000 entrées)
- [ ] Export CSV/JSON
- [ ] Test : Simuler 1h, vérifier events générés

### Phase 6 : Jumeau Numérique (Semaine 9-10)
**Objectif :** Fiche détaillée bus

- [ ] Modal DigitalTwin
- [ ] Onglet Télémétrie
  - [ ] Calcul vitesse temps réel
  - [ ] Simulation portes/jauges
  - [ ] Jauges visuelles (Shadcn)
- [ ] Onglet Caméra 360
  - [ ] Player vidéo équirectangulaire
  - [ ] Contrôles panoramiques
  - [ ] 4 vues (placeholder si pas vidéo)
- [ ] Onglet Girouette LED
  - [ ] Rendu CSS Grid matriciel
  - [ ] Animation défilement
- [ ] Onglet Stats/Historique
- [ ] Test : Ouvrir fiche, toutes données affichées

### Phase 7 : Polish & Optimisation (Semaine 11-12)
**Objectif :** Finalisation

- [ ] SVG buses finaux (design professionnel)
- [ ] Responsive design (mobile/tablet)
- [ ] Loading states & spinners
- [ ] Error boundaries
- [ ] Messages informatifs (pas de données, etc.)
- [ ] Performance audit (Lighthouse)
- [ ] Corrections bugs
- [ ] Documentation utilisateur (README)
- [ ] Déploiement (Vercel/Netlify)

---

## 9. Risques Techniques & Mitigations

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Performance < 30 FPS (300 bus) | Critique | Haute | Web Worker + LOD + Viewport Culling + Throttling |
| GTFS ↔ OSM mismatch | Majeur | Moyenne | Algorithme snapping + Validation manuelle initiale |
| Overpass API rate-limit | Mineur | Moyenne | Cache localStorage + Fallback statique |
| Memory leak (longues sessions) | Majeur | Moyenne | Cleanup régulier + Limite historique |
| SVG buses pas créés | Mineur | Certaine | Phase 1-6 : rectangles colorés, Phase 7 : design pro |
| Manque données GTFS | Critique | Faible | Vérifier dispo sur transport.data.gouv.fr ASAP |

---

## 10. Livrables Finaux

1. **Application Web fonctionnelle**
   - URL déployée (ex: saeiv-stan.vercel.app)
   - Fonctionne sur Chrome/Firefox/Safari
   - Responsive (desktop + tablet minimum)

2. **Code source**
   - Repository Git propre
   - README complet (installation, utilisation)
   - Types TypeScript documentés
   - Code commenté (parties complexes)

3. **Assets**
   - SVG buses professionnels (6 fichiers minimum)
   - Vidéos 360° (optionnel, fallback photos)
   - Données GTFS + OSM mapping

4. **Documentation**
   - Guide utilisateur (PDF ou Markdown)
   - Documentation technique (architecture)
   - Guide de maintenance (update GTFS, etc.)

---

## 11. Évolutions Futures (Post-MVP)

### Phase Post-Launch (optionnelle)

1. **Backend optionnel** (si besoin réel)
   - Synchronisation multi-utilisateurs
   - Persistance déviations partagées
   - Authentification

2. **Temps réel** (si données dispo)
   - Connexion API temps réel Stan (SIRI, GTFS-RT)
   - Positions GPS réelles vs théoriques

3. **Analytics**
   - Statistiques d'exploitation
   - Tableaux de bord KPI
   - Export rapports

4. **3D** (ambitieux)
   - Rendu Three.js des bus
   - Vue 3D du réseau
   - Caméra 360° générée dynamiquement

---

## 12. Notes de Mise en Œuvre

### 12.1 Récupération Données GTFS
**Action immédiate :**
1. Aller sur https://transport.data.gouv.fr/
2. Rechercher "Stan Nancy" ou "Grand Nancy"
3. Télécharger le dataset GTFS le plus récent
4. Vérifier présence des fichiers requis
5. Placer dans `/public/data/gtfs/`

### 12.2 Mapping OSM
**Outils recommandés :**
- Overpass Turbo (https://overpass-turbo.eu/) pour explorer
- JOSM ou iD Editor pour identifier les relation IDs
- Documentation : https://wiki.openstreetmap.org/wiki/FR:Transports_en_commun

**Requête type :**
```
[out:json];
area["name"="Nancy"]->.a;
(
  relation["type"="route"]["route"="bus"]["ref"="1"](area.a);
);
out geom;
```

### 12.3 Parking OSM
**Méthode :**
1. Identifier les dépôts de bus sur OSM (chercher "Dépôt Stan")
2. Utiliser JOSM pour dessiner les places de parking (polygones)
3. Taguer : `amenity=parking`, `parking=bus`, `operator=Stan`
4. Noter les way IDs pour le registry

**Alternative si pas de données OSM :**
- Créer des positions approximatives (lat/lng fixes)
- Générer des polygones rectangulaires virtuels

### 12.4 SVG Buses (À créer)
**Spécifications techniques :**
- Format : SVG optimisé (SVGO)
- Dimensions : 100x30px (ratio réaliste)
- Vue : Top-down (vue du dessus)
- Couleurs : Utiliser variables CSS pour couleurs de ligne
- Détails : Fenêtres, portes, articulations visibles

**Template example :**
```svg
<svg width="100" height="30" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="100" height="30" fill="var(--bus-color)" />
  <rect x="10" y="5" width="8" height="8" fill="#87CEEB" opacity="0.7" />
  <!-- Fenêtres, détails... -->
</svg>
```

**Outils recommandés :**
- Figma / Illustrator pour design
- SVGOMG pour optimisation
- Inspiration : Bus top-view vectors sur Flaticon

---

## 13. Checklist de Démarrage

Avant de commencer le développement :

- [ ] Télécharger GTFS Stan Nancy
- [ ] Vérifier qualité des données GTFS (pas de trips vides)
- [ ] Identifier 5-10 lignes principales sur OSM
- [ ] Créer fichier osm-routes-mapping.json (même partiel)
- [ ] Décider approche SVG buses (placeholder puis pro ?)
- [ ] Installer Node.js 18+ et pnpm/npm
- [ ] Créer repo Git
- [ ] Setup Next.js project
- [ ] Lire doc Turf.js (along, bearing, nearestPointOnLine)

---

## 14. Métriques de Succès

Le projet sera considéré comme réussi si :

1. **Performance :**
   - 60 FPS avec 50 bus visibles simultanément
   - 30+ FPS avec 300 bus (viewport culling actif)
   - Chargement initial < 15 secondes

2. **Fonctionnel :**
   - Time Warp fluide (pause/play/speeds)
   - Buses suivent tracés GTFS/OSM fidèlement
   - Articulation visible dans virages (zoom >15)
   - Main courante enregistre tous events
   - Déviations créées et appliquées correctement

3. **UX :**
   - Interface intuitive (pas de tutorial nécessaire)
   - Responsive desktop + tablet
   - Pas de crash après 1h d'utilisation continue

4. **Qualité Code :**
   - TypeScript strict (pas de `any`)
   - Tests unitaires (algorithmes critiques)
   - Code commenté (parties complexes)
   - Pas de console.error en production

---

## Fin des Spécifications

**Version :** 2.0
**Date :** 2026-01-03
**Auteur :** SAEIV Stan Project
**Status :** Complet - Prêt pour développement
