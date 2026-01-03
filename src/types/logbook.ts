/**
 * Logbook Types
 * Main Courante - Journal de bord de l'exploitation
 */

/**
 * Types d'événements automatiques
 */
export type AutoEventType =
  | 'SERVICE_START' // Bus prend son service
  | 'SERVICE_END' // Bus termine son service
  | 'DEPOT_EXIT' // Sortie du dépôt
  | 'DEPOT_ENTRY' // Retour au dépôt
  | 'DELAY_DETECTED' // Retard >5 min détecté
  | 'EARLY_DETECTED' // Avance >3 min détectée
  | 'OFF_ROUTE' // Écart >50m du tracé théorique
  | 'TECH_ALARM'; // Alarme technique (simulation)

/**
 * Types d'événements manuels
 */
export type ManualEventType =
  | 'INCIDENT' // Déclaration incident
  | 'REGULATION_ACTION' // Action de régulation
  | 'DEVIATION_CREATED' // Mise en place déviation
  | 'NOTE'; // Note libre

export type EventType = AutoEventType | ManualEventType;

/**
 * Niveau de sévérité
 */
export type EventSeverity = 'info' | 'warning' | 'critical';

/**
 * Entrée dans le logbook
 */
export interface LogbookEntry {
  id: string;
  timestamp: number; // Unix ms (temps réel)
  virtualTimestamp: number; // Temps virtuel de l'événement
  type: EventType;
  severity: EventSeverity;

  // Contexte
  busId?: string;
  lineId?: string;
  location?: GeoJSON.Point;

  // Détails
  title: string;
  description?: string;
  metadata?: Record<string, any>; // Données spécifiques à l'event

  // Meta
  isAutomatic: boolean;
  userId?: string; // Pour évolution future
}

/**
 * Filtres pour le logbook
 */
export interface LogbookFilters {
  types?: EventType[];
  severities?: EventSeverity[];
  lineIds?: string[];
  busIds?: string[];
  searchQuery?: string;
  startTime?: number;
  endTime?: number;
}
