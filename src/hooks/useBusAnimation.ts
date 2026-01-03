/**
 * Bus Animation Hook
 * Anime les bus le long de leurs routes
 */

'use client';

import { useCallback } from 'react';
import { useFleetStore } from '@/stores/useFleetStore';
import { useMapStore } from '@/stores/useMapStore';
import { calculateAllBusPositions } from '@/services/positionCalculator';
import { useAnimationLoop } from './useAnimationLoop';

interface UseBusAnimationOptions {
  enabled?: boolean;
}

export function useBusAnimation(options: UseBusAnimationOptions = {}) {
  const { enabled = true } = options;

  const vehicles = useFleetStore((state) => state.vehicles);
  const updatePositions = useFleetStore((state) => state.updatePositions);
  const routeGeometries = useMapStore((state) => state.routeGeometries);

  // Callback appelé à chaque frame
  const onFrame = useCallback(
    (deltaTime: number) => {
      if (vehicles.length === 0) return;

      // Calculer les nouvelles positions
      const updates = calculateAllBusPositions(
        vehicles,
        routeGeometries,
        deltaTime
      );

      // Mettre à jour le store
      if (updates.length > 0) {
        updatePositions(updates);
      }
    },
    [vehicles, routeGeometries, updatePositions]
  );

  // Lancer la boucle d'animation
  useAnimationLoop({
    onFrame,
    enabled,
  });
}
