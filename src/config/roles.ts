import { 
  Anchor, 
  ShieldAlert, 
  Activity, 
  Database, 
  Ship, 
  type LucideIcon 
} from 'lucide-react';
import type { UserRole } from '@/types/contract';

export interface RoleConfig {
  id: UserRole;
  label: string;
  shortLabel: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  badgeStyle: string;
  defaultPath: string;
  primaryPerspective: string;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  FISHERMAN: {
    id: 'FISHERMAN',
    label: 'Fisherman & Vessel Operator',
    shortLabel: 'Fisherman',
    tagline: 'Trip & Pelagic Advisory',
    description: 'Personalized operational clearance, potential fishing zone signals, and route safety constraints.',
    icon: Anchor,
    badgeStyle: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60',
    defaultPath: '/dashboard',
    primaryPerspective: 'Trip & Mission Safety',
  },
  COASTAL_AUTHORITY: {
    id: 'COASTAL_AUTHORITY',
    label: 'Coastal Guard & Port Authority',
    shortLabel: 'Authority',
    tagline: 'Fleet & Incident Monitoring',
    description: 'Multi-vessel tracking, naval restricted zone incursion monitoring, and enforcement advisories.',
    icon: ShieldAlert,
    badgeStyle: 'bg-blue-950/60 text-blue-400 border-blue-800/60',
    defaultPath: '/authority',
    primaryPerspective: 'Maritime Domain Awareness',
  },
  DISASTER_MANAGER: {
    id: 'DISASTER_MANAGER',
    label: 'Disaster Management (NDRF / SDMA)',
    shortLabel: 'Disaster Mgmt',
    tagline: 'Hazard Exposure & Evacuation',
    description: 'Cyclone warnings, high swell risk exposure, coastal population tracking, and emergency alerts.',
    icon: Activity,
    badgeStyle: 'bg-rose-950/60 text-rose-400 border-rose-800/60',
    defaultPath: '/disaster',
    primaryPerspective: 'Hazard Exposure & Response',
  },
  RESEARCHER: {
    id: 'RESEARCHER',
    label: 'Marine Scientist & Data Analyst',
    shortLabel: 'Research',
    tagline: 'Oceanographic Evidence & Models',
    description: 'Multi-agency observation correlation, SST/Chlorophyll front explorer, and decision rule audit.',
    icon: Database,
    badgeStyle: 'bg-purple-950/60 text-purple-400 border-purple-800/60',
    defaultPath: '/researcher',
    primaryPerspective: 'Evidence & Model Verification',
  },
  MARITIME_OPERATOR: {
    id: 'MARITIME_OPERATOR',
    label: 'Commercial Maritime Operator',
    shortLabel: 'Operator',
    tagline: 'Fleet Dispatch & Harbor Ops',
    description: 'Commercial tug, ferry, and survey craft fleet dispatch, weather windows, and route optimization.',
    icon: Ship,
    badgeStyle: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60',
    defaultPath: '/operator',
    primaryPerspective: 'Fleet Dispatch & Logistics',
  },
};

export const AVAILABLE_ROLES: UserRole[] = [
  'FISHERMAN',
  'COASTAL_AUTHORITY',
  'DISASTER_MANAGER',
  'RESEARCHER',
  'MARITIME_OPERATOR',
];
