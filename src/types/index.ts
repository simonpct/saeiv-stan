/**
 * Central export for all types
 */

export * from './vehicle-model';
export * from './fleet';
export * from './gtfs';
export * from './osm';
export * from './logbook';
export * from './deviation';

/**
 * Common utility types
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Time-related types
 */
export type SpeedFactor = 1 | 2 | 5 | 10 | 30 | 60 | 100;

export interface TimeState {
  virtualTimestamp: number; // Unix timestamp en ms
  speedFactor: SpeedFactor;
  isPaused: boolean;
  realStartTime: number; // Pour synchronisation
}
