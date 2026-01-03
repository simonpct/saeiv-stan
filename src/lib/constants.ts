/**
 * Application-wide constants
 */

// Map configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 48.6921, lng: 6.1844 }, // Nancy
  DEFAULT_ZOOM: 13,
  MIN_ZOOM: 10,
  MAX_ZOOM: 18,
} as const;

// LOD (Level of Detail) configuration
export const LOD_CONFIG = {
  SIMPLE_ICON_MAX_ZOOM: 13,
  BI_SEGMENT_MAX_ZOOM: 15,
  FULL_DETAIL_MIN_ZOOM: 15,
} as const;

// Performance configuration
export const PERFORMANCE_CONFIG = {
  TARGET_FPS: 60,
  OFF_SCREEN_UPDATE_INTERVAL_MS: 500, // 2 FPS for off-screen buses
  VIEWPORT_MARGIN_PERCENT: 0.1, // 10% margin around viewport
  MAX_CACHE_AGE_DAYS: 7,
} as const;

// Punctuality thresholds (in minutes)
export const PUNCTUALITY = {
  ON_TIME_MIN: -3,
  ON_TIME_MAX: 3,
  LATE_THRESHOLD: 10,
  EARLY_THRESHOLD: 5,
} as const;

// Line health status
export const LINE_HEALTH = {
  GOOD_THRESHOLD: 90, // > 90% punctuality
  WARNING_THRESHOLD: 70, // 70-90% punctuality
  // < 70% is critical
} as const;
