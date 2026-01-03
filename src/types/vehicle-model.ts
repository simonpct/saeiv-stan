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
  };
  propulsion: PropulsionType;
}

// ============================================================================
// MODÈLES DE BUS PRÉDÉFINIS
// ============================================================================

/**
 * Bus Standard 12m
 */
export const STANDARD_12M: BusModelStats = {
  id: 'standard_12m',
  name: 'Bus Standard 12m',
  type: 'STANDARD',
  totalLength: 12,
  width: 2.5,
  segments: [
    {
      id: 'head',
      length: 12,
      spriteUrl: '/assets/bus/standard-12m.svg',
      offset: 0,
    },
  ],
  capacity: { seated: 30, standing: 50 },
  propulsion: 'diesel',
};

/**
 * Bus Articulé 18m
 */
export const ARTICULATED_18M: BusModelStats = {
  id: 'articulated_18m',
  name: 'Bus Articulé 18m',
  type: 'ARTICULATED',
  totalLength: 18,
  width: 2.5,
  segments: [
    {
      id: 'head',
      length: 10,
      spriteUrl: '/assets/bus/articulated-head.svg',
      offset: 0,
    },
    {
      id: 'trailer1',
      length: 8,
      spriteUrl: '/assets/bus/articulated-tail.svg',
      offset: 10.5, // 10m + 0.5m articulation gap
    },
  ],
  capacity: { seated: 45, standing: 95 },
  propulsion: 'diesel',
};

/**
 * Hess Lightram 25 (Bi-articulé)
 * Bus électrique bi-articulé utilisé sur les lignes Tempo
 */
export const HESS_LIGHTRAM_25: BusModelStats = {
  id: 'hess_lightram_25',
  name: 'Hess Lightram 25 (Bi-articulé)',
  type: 'BI_ARTICULATED',
  totalLength: 24.7,
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
  capacity: { seated: 56, standing: 99 },
  propulsion: 'electric',
};

/**
 * Registry de tous les modèles disponibles
 */
export const BUS_MODELS: Record<string, BusModelStats> = {
  standard_12m: STANDARD_12M,
  articulated_18m: ARTICULATED_18M,
  hess_lightram_25: HESS_LIGHTRAM_25,
};

/**
 * Helper pour récupérer un modèle par ID
 */
export function getBusModel(modelId: string): BusModelStats | undefined {
  return BUS_MODELS[modelId];
}
