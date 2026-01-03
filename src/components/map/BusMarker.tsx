'use client';

/**
 * Bus Marker Component
 * Affiche un bus sur la carte
 */

import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import type { BusInstance } from '@/types';
import L from 'leaflet';

interface BusMarkerProps {
  bus: BusInstance;
}

// Créer une icône personnalisée simple pour le bus
const createBusIcon = (color: string = '#3B82F6') => {
  return L.divIcon({
    className: 'bus-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-center;
        color: white;
        font-size: 10px;
        font-weight: bold;
      ">
        🚌
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

export function BusMarker({ bus }: BusMarkerProps) {
  // Si pas de position, ne rien afficher
  if (!bus.position || !bus.position.segments || bus.position.segments.length === 0) {
    return null;
  }

  // Utiliser la position du premier segment (tête du bus)
  const headPosition = bus.position.segments[0];

  return (
    <Marker
      position={[headPosition.lat, headPosition.lng]}
      icon={createBusIcon()}
    >
      <Popup>
        <div className="text-sm">
          <h3 className="font-bold">Bus {bus.id}</h3>
          <p className="text-xs text-muted-foreground">
            Modèle: {bus.modelId}
          </p>
          <p className="text-xs text-muted-foreground">
            État: {bus.state}
          </p>
          {bus.currentRoute && (
            <p className="text-xs text-muted-foreground">
              Ligne: {bus.currentRoute}
            </p>
          )}
          {bus.position.speed !== undefined && (
            <p className="text-xs">
              Vitesse: {bus.position.speed.toFixed(1)} km/h
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
