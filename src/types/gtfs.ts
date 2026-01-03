/**
 * GTFS Types
 * Structures de données pour les fichiers GTFS
 */

/**
 * Arrêt de bus (stops.txt)
 */
export interface GTFSStop {
  stop_id: string;
  stop_code?: string;
  stop_name: string;
  stop_desc?: string;
  stop_lat: number;
  stop_lon: number;
  zone_id?: string;
  stop_url?: string;
  location_type?: number;
  parent_station?: string;
  stop_timezone?: string;
  wheelchair_boarding?: number;
}

/**
 * Ligne de bus (routes.txt)
 */
export interface GTFSRoute {
  route_id: string;
  agency_id?: string;
  route_short_name: string;
  route_long_name: string;
  route_desc?: string;
  route_type: number;
  route_url?: string;
  route_color?: string;
  route_text_color?: string;
}

/**
 * Course (trips.txt)
 */
export interface GTFSTrip {
  route_id: string;
  service_id: string;
  trip_id: string;
  trip_headsign?: string;
  trip_short_name?: string;
  direction_id: 0 | 1;
  block_id?: string;
  shape_id?: string;
  wheelchair_accessible?: number;
  bikes_allowed?: number;
}

/**
 * Horaire de passage à un arrêt (stop_times.txt)
 */
export interface GTFSStopTime {
  trip_id: string;
  arrival_time: string; // HH:MM:SS (peut dépasser 24h ex: 25:30:00)
  departure_time: string; // HH:MM:SS
  stop_id: string;
  stop_sequence: number;
  pickup_type?: number;
  drop_off_type?: number;
  shape_dist_traveled?: number; // Distance en mètres depuis début du shape
}

/**
 * Point d'un tracé (shapes.txt)
 */
export interface GTFSShape {
  shape_id: string;
  shape_pt_lat: number;
  shape_pt_lon: number;
  shape_pt_sequence: number;
  shape_dist_traveled?: number;
}

/**
 * Calendrier de service (calendar.txt)
 */
export interface GTFSCalendar {
  service_id: string;
  monday: 0 | 1;
  tuesday: 0 | 1;
  wednesday: 0 | 1;
  thursday: 0 | 1;
  friday: 0 | 1;
  saturday: 0 | 1;
  sunday: 0 | 1;
  start_date: string; // YYYYMMDD
  end_date: string; // YYYYMMDD
}

/**
 * Exceptions de calendrier (calendar_dates.txt)
 */
export interface GTFSCalendarDate {
  service_id: string;
  date: string; // YYYYMMDD
  exception_type: 1 | 2; // 1 = service ajouté, 2 = service supprimé
}

/**
 * Agence (agency.txt)
 */
export interface GTFSAgency {
  agency_id?: string;
  agency_name: string;
  agency_url: string;
  agency_timezone: string;
  agency_lang?: string;
  agency_phone?: string;
  agency_fare_url?: string;
  agency_email?: string;
}

/**
 * Segment actif entre deux arrêts
 * Utilisé pour l'interpolation de position
 */
export interface ActiveSegment {
  stopA: GTFSStop;
  stopB: GTFSStop;
  departureTime: number; // Unix timestamp en ms
  arrivalTime: number; // Unix timestamp en ms
  tripId: string;
  routeId: string;
}

/**
 * Données GTFS parsées et indexées
 */
export interface ParsedGTFSData {
  routes: Map<string, GTFSRoute>;
  stops: Map<string, GTFSStop>;
  trips: Map<string, GTFSTrip>;
  stopTimes: Map<string, GTFSStopTime[]>; // Indexed by trip_id
  shapes: Map<string, GeoJSON.LineString>; // Indexed by shape_id
  calendar?: Map<string, GTFSCalendar>;
  calendarDates?: Map<string, GTFSCalendarDate[]>;
}
