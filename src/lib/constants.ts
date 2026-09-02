/**
 * ORCA — Core System Constants
 */

export const APP_NAME = 'ORCA';
export const APP_FULL_NAME = 'Marine EcOsystem Reasoning with Collaborative Agents';
export const SIH_PROBLEM_STATEMENT = 'SIH26176 — ISRO Software';

export const SYSTEM_DEFAULTS = {
  HOME_PORT: {
    name: 'Sassoon Docks (Mumbai)',
    latitude: 18.915,
    longitude: 72.825,
  },
  DEFAULT_MAP_CENTER: [18.85, 72.75] as [number, number],
  DEFAULT_MAP_ZOOM: 10,
  DATA_FRESHNESS_WINDOW_HOURS: 12,
} as const;
