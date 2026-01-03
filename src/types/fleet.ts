/**
 * Fleet Types
 * Gestion de la flotte de véhicules et leurs états
 */

/**
 * États possibles d'un véhicule
 */
export type VehicleState =
  | 'IN_SERVICE' // En ligne, suit un trip GTFS
  | 'GARAGE' // Au dépôt, positionné sur parking OSM
  | 'DEADHEAD' // Haut-le-pied (vers dépôt ou prise service)
  | 'MAINTENANCE'; // Immobilisé (maintenance)

/**
 * Télémétrie d'un véhicule
 */
export interface VehicleTelemetry {
  // Calculé depuis position
  speed: number; // km/h (delta de position)
  heading: number; // degrés (0-360)

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

/**
 * Position d'un segment de véhicule
 */
export interface SegmentPosition {
  lat: number;
  lng: number;
  bearing: number; // degrés (orientation du segment)
}

/**
 * Position calculée d'un véhicule
 */
export interface VehiclePosition {
  segments: SegmentPosition[];
  speed: number; // km/h
  distance?: number; // Distance parcourue sur le tracé (mètres)
  nextStop?: string; // ID du prochain arrêt GTFS
}

/**
 * Instance d'un bus dans la flotte
 */
export interface BusInstance {
  id: string; // ex: "101"
  modelId: string; // ref vers BusModelStats (ex: "hess_lightram_25")
  osmParkingWayId?: number; // ID OpenStreetMap de la place de parking

  // Affectation théorique
  gtfsTripId?: string; // Course GTFS en cours
  currentRoute?: string; // Ligne en cours (ex: "1" pour T1)

  // État opérationnel
  state: VehicleState;

  // Position calculée (mise à jour par le solver)
  position?: VehiclePosition;

  // Télémétrie simulée
  telemetry?: VehicleTelemetry;

  // Métadonnées pour calculs
  previousDistance?: number; // Pour calcul vitesse
  lastUpdateTime?: number; // Timestamp dernière mise à jour
}

/**
 * État de la flotte complète
 */
export interface Fleet {
  vehicles: BusInstance[];
  lastUpdate: number; // timestamp
}

/**
 * Payload pour mise à jour de positions (depuis Worker)
 */
export interface BusPositionUpdate {
  busId: string;
  position: VehiclePosition;
  telemetry?: Partial<VehicleTelemetry>;
}
