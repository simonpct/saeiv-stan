/**
 * Deviation Types
 * Gestion des déviations de lignes
 */

/**
 * Déviation d'une ligne
 */
export interface Deviation {
  id: string;
  name: string; // ex: "Travaux Rue Saint-Dizier"
  lineId: string; // GTFS route_id concerné

  originalPath: GeoJSON.LineString; // Tracé original
  deviationPath: GeoJSON.LineString; // Nouveau tracé

  // Validité temporelle
  validFrom: string; // ISO date
  validTo: string; // ISO date

  // Metadata
  createdAt: string; // ISO date
  createdBy?: string; // Pour évolution future
  reason?: string; // Raison de la déviation
}

/**
 * État des déviations actives
 */
export interface DeviationsState {
  deviations: Deviation[];
  activeDeviations: Map<string, Deviation>; // Indexed by lineId
}

/**
 * Waypoint pour création de déviation
 */
export interface DeviationWaypoint {
  lat: number;
  lng: number;
  snappedTo?: {
    osmWayId: number;
    lat: number;
    lng: number;
  };
}
