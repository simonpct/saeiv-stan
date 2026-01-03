/**
 * OSM Types
 * Structures pour géométries OpenStreetMap et mapping
 */

/**
 * Configuration de mapping GTFS Route → OSM Relation
 */
export interface OSMRouteConfig {
  gtfs_route_id: string;
  route_short_name: string;
  osm_relation_id: number | null;
  color: string; // Hex color
  preload: boolean; // Charger au démarrage ?
  comment?: string;
}

/**
 * Géométrie OSM avec métadonnées
 */
export interface OSMGeometry {
  relationId: number;
  geometry: GeoJSON.LineString;
  fetchedAt: number; // timestamp
  version: string; // hash pour invalidation cache
}

/**
 * Place de parking dans un dépôt
 */
export interface ParkingSpot {
  bus_id: string;
  model: string; // Model ID (ex: "hess_lightram_25")
  osm_way_id: number | null; // ID du way OSM (polygon)
  depot_name: string;
  parking_spot: string; // Identifiant (ex: "A-01")
  geometry?: GeoJSON.Polygon; // Géométrie fetchée
  comment?: string;
}

/**
 * Entrée de cache OSM
 */
export interface OSMCacheEntry {
  data: GeoJSON.LineString | GeoJSON.Polygon;
  timestamp: number;
  version: string; // MD5 hash de la géométrie
  expiresAt: number; // timestamp d'expiration
}

/**
 * Mapping complet des routes
 */
export interface OSMRoutesMapping {
  routes: OSMRouteConfig[];
  _comment?: string;
}

/**
 * Registry des parkings
 */
export type ParkingRegistry = ParkingSpot[];
