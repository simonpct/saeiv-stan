'use client';

/**
 * SAEIV Stan - Page Principale
 * Système d'Aide à l'Exploitation et à l'Information Voyageurs
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { TimeController } from '@/components/timeline/TimeController';
import { useBusAnimation } from '@/hooks/useBusAnimation';
import { useFleetStore } from '@/stores/useFleetStore';
import { useMapStore } from '@/stores/useMapStore';
import { useTimeStore } from '@/stores/useTimeStore';
import type { BusInstance } from '@/types';

// Import dynamique pour éviter les problèmes SSR avec MapLibre GL
const MapViewGL = dynamic(() => import('@/components/map/MapViewGL').then((mod) => mod.MapViewGL), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <p className="text-muted-foreground">Chargement de la carte...</p>
    </div>
  ),
});

const BusMarkerGL = dynamic(() => import('@/components/map/BusMarkerGL').then((mod) => mod.BusMarkerGL), {
  ssr: false,
});

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { vehicles, addVehicle } = useFleetStore();
  const { setRouteGeometry } = useMapStore();
  const play = useTimeStore((state) => state.play);

  // Éviter l'erreur d'hydratation SSR avec Zustand persist
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-play au démarrage (pour démo)
  useEffect(() => {
    if (mounted) {
      // Délai pour s'assurer que tout est initialisé
      setTimeout(() => {
        play();
        console.log('▶️ Auto-play activé');
      }, 100);
    }
  }, [mounted, play]);

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
        immatriculation: 'TEST-101',
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

      addVehicle(testBus);
      console.log('✅ Bus test initialisé:', testBus);
    }

    initializeDemo();
  }, [setRouteGeometry, addVehicle]);

  // Démarrer l'animation des bus
  useBusAnimation({ enabled: mounted });

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-background">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

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
        <MapViewGL>
          {/* Afficher tous les bus */}
          {vehicles.map((bus) => (
            <BusMarkerGL key={bus.id} bus={bus} />
          ))}
        </MapViewGL>
      </main>

      {/* Time Controller (fixed bottom) */}
      <TimeController />
    </div>
  );
}
