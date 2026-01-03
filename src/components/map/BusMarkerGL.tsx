'use client';

/**
 * Bus Marker Component (MapLibre GL)
 * Affiche un bus sur la carte vectorielle avec rotation native
 */

import React, { useState } from 'react';
import { Marker, Popup } from 'react-map-gl/maplibre';
import type { BusInstance } from '@/types';

interface BusMarkerGLProps {
  bus: BusInstance;
}

export function BusMarkerGL({ bus }: BusMarkerGLProps) {
  const [showPopup, setShowPopup] = useState(false);

  // Si pas de position, ne rien afficher
  if (!bus.position || !bus.position.segments || bus.position.segments.length === 0) {
    return null;
  }

  // Utiliser la position du premier segment (tête du bus)
  const headPosition = bus.position.segments[0];

  return (
    <>
      <Marker
        longitude={headPosition.lng}
        latitude={headPosition.lat}
        rotation={headPosition.bearing} // MapLibre gère la rotation nativement !
        anchor="center"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          setShowPopup(true);
        }}
      >
        <div
          className="bus-sprite cursor-pointer"
          style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#3B82F6',
            border: '2px solid white',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
          }}
        >
          🚌
        </div>
      </Marker>

      {showPopup && (
        <Popup
          longitude={headPosition.lng}
          latitude={headPosition.lat}
          anchor="bottom"
          onClose={() => setShowPopup(false)}
          closeButton={true}
          closeOnClick={false}
        >
          <div className="text-sm p-1">
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
            {bus.position.distance !== undefined && (
              <p className="text-xs">
                Distance: {bus.position.distance.toFixed(0)} m
              </p>
            )}
          </div>
        </Popup>
      )}
    </>
  );
}
