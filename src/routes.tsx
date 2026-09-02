export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  MISSION: '/dashboard/mission',
  MAP: '/dashboard/map',
  DECISIONS: '/dashboard/decisions',
  HISTORY: '/dashboard/history',
  SETTINGS: '/dashboard/settings',
} as const;

export type RouteKey = keyof typeof ROUTES;
