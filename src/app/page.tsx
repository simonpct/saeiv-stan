'use client';

/**
 * SAEIV Stan - Page Principale
 * Système d'Aide à l'Exploitation et à l'Information Voyageurs
 */

import dynamic from 'next/dynamic';
import { TimeController } from '@/components/timeline/TimeController';

// Import dynamique pour éviter les problèmes SSR avec Leaflet
const MapView = dynamic(() => import('@/components/map/MapView').then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <p className="text-muted-foreground">Chargement de la carte...</p>
    </div>
  ),
});

export default function Home() {
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
        <div className="text-xs text-muted-foreground">
          Sprint 1 - MVP en cours
        </div>
      </header>

      {/* Main Map Area */}
      <main className="flex-1 relative">
        <MapView />
      </main>

      {/* Time Controller (fixed bottom) */}
      <TimeController />
    </div>
  );
}
