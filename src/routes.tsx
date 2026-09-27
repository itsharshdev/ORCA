export const ROUTES = {
  // Public Landing & Info
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  LOGIN: '/login',

  // Core Authenticated Operational Modules
  DASHBOARD: '/dashboard',
  ASK: '/ask',
  MISSION: '/mission',
  MAP: '/map',
  ALERTS: '/alerts',
  DECISIONS: '/decisions',
  HISTORY: '/history',
  PROFILE: '/profile',
  SETTINGS: '/settings',

  // Role-Specific Workspaces
  FISHERMAN: '/dashboard',
  AUTHORITY: '/authority',
  DISASTER: '/disaster',
  RESEARCH: '/research',
  RESEARCHER: '/research',
  OPERATOR: '/operator',
} as const;

export type RouteKey = keyof typeof ROUTES;
