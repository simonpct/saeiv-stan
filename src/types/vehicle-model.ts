/**
 * Vehicle Model Types
 * Définitions des modèles de bus et leurs caractéristiques physiques
 */

export type BusType = 'STANDARD' | 'ARTICULATED' | 'BI_ARTICULATED';

export type PropulsionType = 'diesel' | 'electric' | 'hybrid';

export interface BusSegment {
  id: 'head' | 'trailer1' | 'trailer2';
  length: number; // mètres
  spriteUrl: string; // URL du SVG pour cette partie
  offset: number; // Distance par rapport à l'avant du bus (en mètres)
}

export interface BusModelStats {
  id: string;
  name: string;
  type: BusType;
  totalLength: number; // mètres
  width: number; // mètres
  segments: BusSegment[];
  capacity: {
    seated: number;
    standing: number;
    wheelchairSpaces?: number;
  };
  features: {
    airConditioning?: 'full' | 'partial' | 'none';
    wheelchairAccess?: boolean;
    bikeRack?: boolean;
    doors?: number;
  }
  propulsion: PropulsionType;
}

export const HESS_LIGHTRAM_25: BusModelStats = {
  id: 'hess_lightram_25',
  name: 'Hess Lightram 25 (Bi-articulé)',
  type: 'BI_ARTICULATED',
  totalLength: 24.5,
  width: 2.55,
  segments: [
    {
      id: 'head',
      length: 8.2,
      spriteUrl: '/assets/bus/hess-head.svg',
      offset: 0,
    },
    {
      id: 'trailer1',
      length: 8.2,
      spriteUrl: '/assets/bus/hess-middle.svg',
      offset: 8.7, // 8.2m + 0.5m articulation
    },
    {
      id: 'trailer2',
      length: 8.3,
      spriteUrl: '/assets/bus/hess-tail.svg',
      offset: 17.4, // 8.7 + 8.2 + 0.5m articulation
    },
  ],
  capacity: { seated: 41, standing: 157, wheelchairSpaces: 2 },
  features: {
    airConditioning: 'full',
    wheelchairAccess: true,
    bikeRack: true,
    doors: 5,
  },
  propulsion: 'electric',
};

/**
 * Registry de tous les modèles disponibles
 */
export const BUS_MODELS: Record<string, BusModelStats> = {
  hess_lightram_25: HESS_LIGHTRAM_25,
};

/**
 * Helper pour récupérer un modèle par ID
 */
export function getBusModel(modelId: string): BusModelStats | undefined {
  return BUS_MODELS[modelId];
}
