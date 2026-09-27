export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  MISSION: '/dashboard/mission',
  MAP: '/dashboard/map',
  DECISIONS: '/dashboard/decisions',
  HISTORY: '/dashboard/history',
  SETTINGS: '/dashboard/settings',
  ALERTS: '/dashboard/alerts',

  // Role-specific Workspaces
  FISHERMAN: '/dashboard',
  AUTHORITY: '/authority',
  DISASTER: '/disaster',
  RESEARCHER: '/researcher',
  OPERATOR: '/operator',
} as const;

export type RouteKey = keyof typeof ROUTES;
