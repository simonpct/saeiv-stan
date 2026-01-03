/**
 * GTFS Parser Service
 * Parse les fichiers GTFS et indexe les données
 */

import type {
  GTFSRoute,
  GTFSStop,
  GTFSTrip,
  GTFSStopTime,
  GTFSShape,
  ParsedGTFSData,
} from '@/types';

/**
 * Parse un fichier CSV GTFS
 */
function parseCSV<T>(csvText: string): T[] {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];

  // Enlever BOM si présent
  const header = lines[0].replace(/^\uFEFF/, '').split(',');
  const data: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const obj: any = {};

    header.forEach((key, index) => {
      const value = values[index]?.trim() || '';
      obj[key] = value;
    });

    data.push(obj as T);
  }

  return data;
}

/**
 * Parse une ligne CSV en gérant les guillemets
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Convertir un temps GTFS (HH:MM:SS) en timestamp
 * Note: GTFS peut avoir des heures > 24 (ex: 25:30:00 = 1:30 AM le lendemain)
 */
export function gtfsTimeToTimestamp(
  gtfsTime: string,
  baseDate: Date
): number {
  const [hours, minutes, seconds] = gtfsTime.split(':').map(Number);

  const date = new Date(baseDate);
  date.setHours(0, 0, 0, 0);

  // Ajouter les heures (peut dépasser 24h)
  const totalMs = (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
  return date.getTime() + totalMs;
}

/**
 * Parse le fichier routes.txt
 */
export async function parseRoutes(basePath: string): Promise<Map<string, GTFSRoute>> {
  const response = await fetch(`${basePath}/routes.txt`);
  const text = await response.text();
  const routes = parseCSV<GTFSRoute>(text);

  const routesMap = new Map<string, GTFSRoute>();
  routes.forEach((route) => {
    routesMap.set(route.route_id, route);
  });

  return routesMap;
}

/**
 * Parse le fichier stops.txt
 */
export async function parseStops(basePath: string): Promise<Map<string, GTFSStop>> {
  const response = await fetch(`${basePath}/stops.txt`);
  const text = await response.text();
  const stops = parseCSV<any>(text);

  const stopsMap = new Map<string, GTFSStop>();
  stops.forEach((stop: any) => {
    stopsMap.set(stop.stop_id, {
      ...stop,
      stop_lat: parseFloat(stop.stop_lat),
      stop_lon: parseFloat(stop.stop_lon),
      location_type: stop.location_type ? parseInt(stop.location_type) : undefined,
      wheelchair_boarding: stop.wheelchair_boarding
        ? parseInt(stop.wheelchair_boarding)
        : undefined,
    });
  });

  return stopsMap;
}

/**
 * Parse le fichier trips.txt
 */
export async function parseTrips(basePath: string): Promise<Map<string, GTFSTrip>> {
  const response = await fetch(`${basePath}/trips.txt`);
  const text = await response.text();
  const trips = parseCSV<any>(text);

  const tripsMap = new Map<string, GTFSTrip>();
  trips.forEach((trip: any) => {
    tripsMap.set(trip.trip_id, {
      ...trip,
      direction_id: parseInt(trip.direction_id || '0') as 0 | 1,
      wheelchair_accessible: trip.wheelchair_accessible
        ? parseInt(trip.wheelchair_accessible)
        : undefined,
      bikes_allowed: trip.bikes_allowed ? parseInt(trip.bikes_allowed) : undefined,
    });
  });

  return tripsMap;
}

/**
 * Parse le fichier stop_times.txt
 * Retourne une Map indexée par trip_id
 */
export async function parseStopTimes(
  basePath: string
): Promise<Map<string, GTFSStopTime[]>> {
  const response = await fetch(`${basePath}/stop_times.txt`);
  const text = await response.text();
  const stopTimes = parseCSV<any>(text);

  const stopTimesMap = new Map<string, GTFSStopTime[]>();

  stopTimes.forEach((st: any) => {
    const stopTime: GTFSStopTime = {
      trip_id: st.trip_id,
      arrival_time: st.arrival_time,
      departure_time: st.departure_time,
      stop_id: st.stop_id,
      stop_sequence: parseInt(st.stop_sequence),
      pickup_type: st.pickup_type ? parseInt(st.pickup_type) : undefined,
      drop_off_type: st.drop_off_type ? parseInt(st.drop_off_type) : undefined,
      shape_dist_traveled: st.shape_dist_traveled
        ? parseFloat(st.shape_dist_traveled)
        : undefined,
    };

    const existing = stopTimesMap.get(st.trip_id) || [];
    existing.push(stopTime);
    stopTimesMap.set(st.trip_id, existing);
  });

  // Trier par stop_sequence
  stopTimesMap.forEach((times, tripId) => {
    times.sort((a, b) => a.stop_sequence - b.stop_sequence);
  });

  return stopTimesMap;
}

/**
 * Parse le fichier shapes.txt et convertit en LineString GeoJSON
 */
export async function parseShapes(
  basePath: string
): Promise<Map<string, GeoJSON.LineString>> {
  const response = await fetch(`${basePath}/shapes.txt`);
  const text = await response.text();
  const shapes = parseCSV<any>(text);

  // Grouper par shape_id
  const shapeGroups = new Map<string, GTFSShape[]>();
  shapes.forEach((shape: any) => {
    const shapePoint: GTFSShape = {
      shape_id: shape.shape_id,
      shape_pt_lat: parseFloat(shape.shape_pt_lat),
      shape_pt_lon: parseFloat(shape.shape_pt_lon),
      shape_pt_sequence: parseInt(shape.shape_pt_sequence),
      shape_dist_traveled: shape.shape_dist_traveled
        ? parseFloat(shape.shape_dist_traveled)
        : undefined,
    };

    const existing = shapeGroups.get(shape.shape_id) || [];
    existing.push(shapePoint);
    shapeGroups.set(shape.shape_id, existing);
  });

  // Convertir en LineString GeoJSON
  const lineStrings = new Map<string, GeoJSON.LineString>();
  shapeGroups.forEach((points, shapeId) => {
    // Trier par sequence
    points.sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence);

    const coordinates: [number, number][] = points.map((p) => [
      p.shape_pt_lon,
      p.shape_pt_lat,
    ]);

    lineStrings.set(shapeId, {
      type: 'LineString',
      coordinates,
    });
  });

  return lineStrings;
}

/**
 * Parse tous les fichiers GTFS d'un coup
 */
export async function parseGTFS(basePath: string): Promise<ParsedGTFSData> {
  console.log('📊 Parsing GTFS data from:', basePath);

  const [routes, stops, trips, stopTimes, shapes] = await Promise.all([
    parseRoutes(basePath),
    parseStops(basePath),
    parseTrips(basePath),
    parseStopTimes(basePath),
    parseShapes(basePath),
  ]);

  console.log('✅ GTFS parsed successfully:', {
    routes: routes.size,
    stops: stops.size,
    trips: trips.size,
    stopTimes: stopTimes.size,
    shapes: shapes.size,
  });

  return {
    routes,
    stops,
    trips,
    stopTimes,
    shapes,
  };
}

/**
 * Parse uniquement une ligne spécifique (pour dev/test)
 */
export async function parseGTFSForRoute(
  basePath: string,
  routeId: string
): Promise<ParsedGTFSData> {
  console.log(`📊 Parsing GTFS data for route ${routeId} from:`, basePath);

  // Parse routes et trips
  const allRoutes = await parseRoutes(basePath);
  const allTrips = await parseTrips(basePath);

  // Filtrer les trips de cette ligne
  const routeTrips = new Map<string, GTFSTrip>();
  allTrips.forEach((trip, tripId) => {
    if (trip.route_id === routeId) {
      routeTrips.set(tripId, trip);
    }
  });

  // Parse stop_times uniquement pour ces trips
  const allStopTimes = await parseStopTimes(basePath);
  const routeStopTimes = new Map<string, GTFSStopTime[]>();
  routeTrips.forEach((trip, tripId) => {
    const times = allStopTimes.get(tripId);
    if (times) {
      routeStopTimes.set(tripId, times);
    }
  });

  // Récupérer les stops utilisés
  const usedStopIds = new Set<string>();
  routeStopTimes.forEach((times) => {
    times.forEach((st) => usedStopIds.add(st.stop_id));
  });

  const allStops = await parseStops(basePath);
  const routeStops = new Map<string, GTFSStop>();
  usedStopIds.forEach((stopId) => {
    const stop = allStops.get(stopId);
    if (stop) routeStops.set(stopId, stop);
  });

  // Récupérer les shapes utilisés
  const usedShapeIds = new Set<string>();
  routeTrips.forEach((trip) => {
    if (trip.shape_id) usedShapeIds.add(trip.shape_id);
  });

  const allShapes = await parseShapes(basePath);
  const routeShapes = new Map<string, GeoJSON.LineString>();
  usedShapeIds.forEach((shapeId) => {
    const shape = allShapes.get(shapeId);
    if (shape) routeShapes.set(shapeId, shape);
  });

  console.log(`✅ GTFS parsed for route ${routeId}:`, {
    trips: routeTrips.size,
    stops: routeStops.size,
    stopTimes: routeStopTimes.size,
    shapes: routeShapes.size,
  });

  return {
    routes: new Map([[routeId, allRoutes.get(routeId)!]]),
    stops: routeStops,
    trips: routeTrips,
    stopTimes: routeStopTimes,
    shapes: routeShapes,
  };
}
