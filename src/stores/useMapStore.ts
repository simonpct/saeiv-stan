/**
 * Map Store - Gestion des géométries OSM et du cache
 *
 * Cache les tracés des lignes et parkings
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OSMGeometry, ParkingSpot } from '@/types';

interface MapState {
  // Géométries des routes (indexed by route_id)
  routeGeometries: Map<string, GeoJSON.LineString>;

  // Géométries des parkings (indexed by way_id)
  parkingGeometries: Map<number, GeoJSON.Polygon>;

  // Métadonnées de cache
  cacheMetadata: Map<
    string,
    {
      fetchedAt: number;
      version: string;
      expiresAt: number;
    }
  >;

  // Actions
  setRouteGeometry: (
    routeId: string,
    geometry: GeoJSON.LineString,
    version?: string
  ) => void;
  getRouteGeometry: (routeId: string) => GeoJSON.LineString | undefined;
  setParkingGeometry: (wayId: number, geometry: GeoJSON.Polygon) => void;
  getParkingGeometry: (wayId: number) => GeoJSON.Polygon | undefined;

  // Cache management
  isCacheValid: (key: string) => boolean;
  clearCache: () => void;
  clearExpiredCache: () => void;
}

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

export const useMapStore = create<MapState>()(
  persist(
    (set, get) => ({
      // État initial
      routeGeometries: new Map(),
      parkingGeometries: new Map(),
      cacheMetadata: new Map(),

      // Définir une géométrie de route
      setRouteGeometry: (routeId, geometry, version = 'v1') => {
        const now = Date.now();
        set((state) => {
          const newRoutes = new Map(state.routeGeometries);
          const newMetadata = new Map(state.cacheMetadata);

          newRoutes.set(routeId, geometry);
          newMetadata.set(routeId, {
            fetchedAt: now,
            version,
            expiresAt: now + CACHE_TTL_MS,
          });

          return {
            routeGeometries: newRoutes,
            cacheMetadata: newMetadata,
          };
        });
      },

      // Récupérer une géométrie de route
      getRouteGeometry: (routeId) => {
        const { routeGeometries, isCacheValid } = get();

        // Vérifier si le cache est valide
        if (!isCacheValid(routeId)) {
          return undefined;
        }

        return routeGeometries.get(routeId);
      },

      // Définir une géométrie de parking
      setParkingGeometry: (wayId, geometry) => {
        const now = Date.now();
        set((state) => {
          const newParking = new Map(state.parkingGeometries);
          const newMetadata = new Map(state.cacheMetadata);

          newParking.set(wayId, geometry);
          newMetadata.set(`parking_${wayId}`, {
            fetchedAt: now,
            version: 'v1',
            expiresAt: now + CACHE_TTL_MS,
          });

          return {
            parkingGeometries: newParking,
            cacheMetadata: newMetadata,
          };
        });
      },

      // Récupérer une géométrie de parking
      getParkingGeometry: (wayId) => {
        const { parkingGeometries, isCacheValid } = get();

        // Vérifier si le cache est valide
        if (!isCacheValid(`parking_${wayId}`)) {
          return undefined;
        }

        return parkingGeometries.get(wayId);
      },

      // Vérifier si une entrée de cache est valide
      isCacheValid: (key) => {
        const { cacheMetadata } = get();
        const metadata = cacheMetadata.get(key);

        if (!metadata) {
          return false;
        }

        return Date.now() < metadata.expiresAt;
      },

      // Vider tout le cache
      clearCache: () => {
        set({
          routeGeometries: new Map(),
          parkingGeometries: new Map(),
          cacheMetadata: new Map(),
        });
      },

      // Vider uniquement les entrées expirées
      clearExpiredCache: () => {
        const { routeGeometries, parkingGeometries, cacheMetadata } = get();
        const now = Date.now();

        const newMetadata = new Map(cacheMetadata);
        const newRoutes = new Map(routeGeometries);
        const newParking = new Map(parkingGeometries);

        // Parcourir et supprimer les entrées expirées
        for (const [key, metadata] of cacheMetadata.entries()) {
          if (now >= metadata.expiresAt) {
            newMetadata.delete(key);

            // Supprimer aussi la géométrie correspondante
            if (key.startsWith('parking_')) {
              const wayId = parseInt(key.replace('parking_', ''));
              newParking.delete(wayId);
            } else {
              newRoutes.delete(key);
            }
          }
        }

        set({
          routeGeometries: newRoutes,
          parkingGeometries: newParking,
          cacheMetadata: newMetadata,
        });
      },
    }),
    {
      name: 'saeiv-map-store',
      // Custom serialization pour Maps
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;

          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              routeGeometries: new Map(state.routeGeometries),
              parkingGeometries: new Map(state.parkingGeometries),
              cacheMetadata: new Map(state.cacheMetadata),
            },
          };
        },
        setItem: (name, newValue) => {
          const str = JSON.stringify({
            state: {
              ...newValue.state,
              routeGeometries: Array.from(
                newValue.state.routeGeometries.entries()
              ),
              parkingGeometries: Array.from(
                newValue.state.parkingGeometries.entries()
              ),
              cacheMetadata: Array.from(
                newValue.state.cacheMetadata.entries()
              ),
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

// Nettoyer le cache expiré au chargement
if (typeof window !== 'undefined') {
  useMapStore.getState().clearExpiredCache();
}
