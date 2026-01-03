'use client';

/**
 * MapView Component (MapLibre GL - Vectoriel)
 * Affiche la carte vectorielle avec support rotation et style dark
 */

import { ReactNode } from 'react';
import Map, { NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapViewGLProps {
  children?: ReactNode;
}

// Style vectoriel gratuit Carto Dark Matter
const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export function MapViewGL({ children }: MapViewGLProps) {
  return (
    <Map
      initialViewState={{
        longitude: 6.1844,
        latitude: 48.6921,
        zoom: 13,
        pitch: 0,
        bearing: 0,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={DARK_STYLE}
      minZoom={10}
      maxZoom={18}
    >
      <NavigationControl position="top-right" />
      {children}
    </Map>
  );
}
