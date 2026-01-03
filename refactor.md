# 📋 PROMPT DE MIGRATION & REFACTORING (V2 - VECTORIEL)

**Contexte :**
Le projet SAEIV "Client-Side" est en cours de développement.
Nous avons décidé de changer le moteur cartographique pour passer de **Leaflet (Raster)** à **MapLibre GL (Vectoriel)** afin de supporter la rotation de la carte, la fluidité 60fps et un style "Dark Mode" vectoriel professionnel.

**Tes Objectifs :**

1. **Migration Tech :** Remplacer les dépendances et les composants `react-leaflet` par `react-map-gl` (MapLibre).
2. **Préservation Métier :** La logique de calcul de position (Zustand + Turf.js) ne doit pas changer. Seul le composant d'affichage (`BusMarker`) doit être adapté.
3. **Anticipation :** Préparer le code pour recevoir les futures User Stories (Bi-articulation des bus, Time Warp, Import OSM).

---

### 1. Changements Techniques Immédiats

**A. Dépendances**

* Désinstaller : `leaflet`, `react-leaflet`
* Installer : `maplibre-gl`, `react-map-gl`

**B. Configuration MapLibre**
Utiliser `react-map-gl` avec le provider gratuit **MapTiler** (ou un style vectoriel open-source générique si pas de clé).

* *Style cible :* Vectoriel Sombre (ex: Carto Dark ou MapTiler Backdrop).
* *Vue initiale :* Centrée sur Nancy (48.692, 6.184).

**C. Refactoring du Composant `Map**`
L'ancien `<MapContainer>` devient :

```tsx
import Map, { NavigationControl, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// ... dans le composant
<Map
  initialViewState={{...}}
  mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" // Style Vectoriel Gratuit
  // ou clé MapTiler via variable d'environnement
>
  <NavigationControl />
  {/* Les bus sont rendus ici */}
</Map>

```

---

### 2. Adaptation des Bus (Markers)

Le composant `BusMarker` doit être adapté pour MapLibre.

* Au lieu de `L.DivIcon`, utiliser le composant `<Marker>` de `react-map-gl`.
* **Rotation :** MapLibre gère la rotation nativement via la prop `rotation` du Marker (plus performant que le CSS transform).

```tsx
<Marker
  longitude={bus.lng}
  latitude={bus.lat}
  rotation={bus.heading} // MapLibre gère la rotation !
>
  <div className="bus-sprite">...</div>
</Marker>

```

---

### 3. Architecture pour les Futures User Stories

Tu dois structurer le code pour faciliter l'ajout des fonctionnalités suivantes (ne pas les coder tout de suite, mais prévoir les "slots") :

* **Slot "Bi-Articulation" :** Le composant `BusMarker` doit accepter une prop `segments` (tableau de positions) au lieu d'une seule position, pour afficher plus tard la tête et les remorques.
* **Slot "Time Warp" :** Le `Map` doit être purement réactif au Store Zustand. Assure-toi que les positions des marqueurs ne sont pas stockées dans un `useState` local lent, mais lues directement depuis le store ou passées via des props optimisées.
* **Slot "OSM Import" :** Prévois un hook `useRouteGeometry` qui pour l'instant retourne une donnée mockée, mais qui sera remplacé par le fetch Overpass plus tard.