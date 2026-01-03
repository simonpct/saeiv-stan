'use client';

/**
 * MapView Component
 * Carte interactive avec Leaflet
 */

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { MAP_CONFIG } from '@/lib/constants';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet avec Next.js
if (typeof window !== 'undefined') {
  const L = require('leaflet');
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  });
}

interface MapViewProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Hook pour gérer la carte après initialisation
 */
function MapController() {
  const map = useMap();

  useEffect(() => {
    // La carte est prête
    console.log('🗺️ Map initialized');

    // Forcer un resize au cas où
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
}

export function MapView({ children, className = '' }: MapViewProps) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      <MapContainer
        center={[MAP_CONFIG.DEFAULT_CENTER.lat, MAP_CONFIG.DEFAULT_CENTER.lng]}
        zoom={MAP_CONFIG.DEFAULT_ZOOM}
        minZoom={MAP_CONFIG.MIN_ZOOM}
        maxZoom={MAP_CONFIG.MAX_ZOOM}
        className="w-full h-full z-0"
        zoomControl={true}
      >
        {/* Tiles OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController />

        {/* Enfants (markers, layers, etc.) */}
        {children}
      </MapContainer>
    </div>
  );
}
