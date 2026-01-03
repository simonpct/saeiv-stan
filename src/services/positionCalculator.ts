/**
 * Position Calculator Service
 * Calcule la position d'un bus le long d'un tracé GeoJSON
 */

import * as turf from '@turf/turf';
import type { BusInstance, SegmentPosition, VehicleTelemetry } from '@/types';
import { getBusModel } from '@/types/vehicle-model';

export interface PositionUpdate {
  busId: string;
  position: {
    segments: SegmentPosition[];
    speed: number;
    distance?: number;
  };
  telemetry?: Partial<VehicleTelemetry>;
}

/**
 * Calcule la nouvelle position d'un bus après un deltaTime
 */
export function calculateBusPosition(
  bus: BusInstance,
  route: GeoJSON.LineString,
  deltaMs: number
): PositionUpdate | null {
  if (!bus.position || bus.state !== 'IN_SERVICE') {
    return null;
  }

  // Obtenir le modèle du bus
  const model = getBusModel(bus.modelId);
  if (!model) {
    console.warn(`Model ${bus.modelId} not found`);
    return null;
  }

  // Vitesse actuelle (convertie en m/ms)
  const speedKmh = bus.position.speed || 0;
  const speedMPerMs = (speedKmh * 1000) / (60 * 60 * 1000);

  // Distance parcourue depuis la dernière mise à jour
  const distanceTraveled = speedMPerMs * deltaMs;

  // Distance totale parcourue
  const currentDistance = bus.previousDistance || 0;
  const newDistance = currentDistance + distanceTraveled;

  // Créer une LineString Turf
  const line = turf.lineString(route.coordinates);
  const lineLength = turf.length(line, { units: 'meters' });

  // Si on dépasse la longueur de la ligne, boucler ou arrêter
  const actualDistance = newDistance % lineLength;

  // Calculer les positions des segments
  const segments: SegmentPosition[] = [];

  for (const segment of model.segments) {
    // Distance de ce segment par rapport à la tête du bus
    const segmentDistance = actualDistance - segment.offset;

    // Si la distance est négative, on est avant le début (bus pas encore sur la ligne)
    if (segmentDistance < 0) continue;
    if (segmentDistance > lineLength) continue;

    // Obtenir le point sur la ligne
    const point = turf.along(line, segmentDistance, { units: 'meters' });

    // Calculer le bearing (direction) en regardant un peu devant
    const lookAheadDistance = Math.min(segmentDistance + 5, lineLength);
    const lookAheadPoint = turf.along(line, lookAheadDistance, {
      units: 'meters',
    });
    const bearing = turf.bearing(point, lookAheadPoint);

    segments.push({
      lat: point.geometry.coordinates[1],
      lng: point.geometry.coordinates[0],
      bearing,
    });
  }

  // Si aucun segment n'est sur la ligne, retourner null
  if (segments.length === 0) {
    return null;
  }

  return {
    busId: bus.id,
    position: {
      segments,
      speed: speedKmh,
      distance: actualDistance,
    },
  };
}

/**
 * Calcule les positions de tous les bus actifs
 */
export function calculateAllBusPositions(
  buses: BusInstance[],
  routes: Map<string, GeoJSON.LineString>,
  deltaMs: number
): PositionUpdate[] {
  const updates: PositionUpdate[] = [];

  for (const bus of buses) {
    if (bus.state !== 'IN_SERVICE' || !bus.currentRoute) {
      continue;
    }

    const route = routes.get(bus.currentRoute);
    if (!route) {
      console.warn(`Route ${bus.currentRoute} not found for bus ${bus.id}`);
      continue;
    }

    const update = calculateBusPosition(bus, route, deltaMs);
    if (update) {
      updates.push(update);
    }
  }

  return updates;
}
