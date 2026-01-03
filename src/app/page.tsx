'use client';

/**
 * SAEIV Stan - Page Principale
 * Système d'Aide à l'Exploitation et à l'Information Voyageurs
 */

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TimeController } from '@/components/timeline/TimeController';
import { useBusAnimation } from '@/hooks/useBusAnimation';
import { useFleetStore } from '@/stores/useFleetStore';
import { useMapStore } from '@/stores/useMapStore';
import type { BusInstance } from '@/types';

// Import dynamique pour éviter les problèmes SSR avec Leaflet
const MapView = dynamic(() => import('@/components/map/MapView').then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <p className="text-muted-foreground">Chargement de la carte...</p>
    </div>
  ),
});

const BusMarker = dynamic(() => import('@/components/map/BusMarker').then((mod) => mod.BusMarker), {
  ssr: false,
});

export default function Home() {
  const { vehicles, initializeFleet } = useFleetStore();
  const { setRouteGeometry } = useMapStore();

  // Initialiser la route mock et le bus test au chargement
  useEffect(() => {
    async function initializeDemo() {
      // Charger la route mock
      const response = await fetch('/data/mock-route-t1.json');
      const mockRoute: GeoJSON.LineString = await response.json();

      // Stocker la route dans le MapStore
      setRouteGeometry('T1', mockRoute);
      console.log('✅ Route mock T1 chargée');

      // Créer un bus test sur cette route, avec une vitesse initiale
      const testBus: BusInstance = {
        id: '101',
        modelId: 'hess_lightram_25',
        state: 'IN_SERVICE',
        currentRoute: 'T1',
        position: {
          segments: [
            {
              lat: 48.6936, // Place Stanislas (début de la route)
              lng: 6.1833,
              bearing: 90,
            },
          ],
          speed: 30, // 30 km/h
        },
        previousDistance: 0,
      };

      initializeFleet([testBus]);
      console.log('✅ Bus test initialisé:', testBus);
    }

    initializeDemo();
  }, [initializeFleet, setRouteGeometry]);

  // Démarrer l'animation des bus
  useBusAnimation({ enabled: true });

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {/* Header */}
      <header className="bg-background border-b z-10 px-4 py-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">SAEIV Stan</h1>
          <p className="text-xs text-muted-foreground">
            Système d'Aide à l'Exploitation - Nancy
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Sprint 1 MVP</span>
          <span>•</span>
          <span>{vehicles.length} bus</span>
        </div>
      </header>

      {/* Main Map Area */}
      <main className="flex-1 relative">
        <MapView>
          {/* Afficher tous les bus */}
          {vehicles.map((bus) => (
            <BusMarker key={bus.id} bus={bus} />
          ))}
        </MapView>
      </main>

      {/* Time Controller (fixed bottom) */}
      <TimeController />
    </div>
  );
}
