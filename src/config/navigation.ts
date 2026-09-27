import { 
  Compass, 
  Map, 
  Navigation2, 
  ShieldCheck, 
  History, 
  Settings, 
  Bell, 
  type LucideIcon 
} from 'lucide-react';
import { ROUTES } from '@/routes';
import type { UserRole } from '@/types/contract';

export interface NavLinkItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  roles?: UserRole[];
  mobileVisible: boolean;
  tag?: string;
}

export const MAIN_NAVIGATION: NavLinkItem[] = [
  {
    id: 'dashboard',
    label: 'Home / Status',
    path: ROUTES.DASHBOARD,
    icon: Compass,
    mobileVisible: true,
  },
  {
    id: 'mission',
    label: 'Trip Planner',
    path: ROUTES.MISSION,
    icon: Navigation2,
    mobileVisible: true,
    tag: 'Plan',
  },
  {
    id: 'map',
    label: 'Marine Map',
    path: ROUTES.MAP,
    icon: Map,
    mobileVisible: true,
  },
  {
    id: 'alerts',
    label: 'Alerts & Safety',
    path: ROUTES.ALERTS,
    icon: Bell,
    mobileVisible: true,
    tag: 'Live',
  },
  {
    id: 'decisions',
    label: 'Decision & Rules',
    path: ROUTES.DECISIONS,
    icon: ShieldCheck,
    mobileVisible: false,
    tag: 'Evidence',
  },
  {
    id: 'history',
    label: 'Mission History',
    path: ROUTES.HISTORY,
    icon: History,
    mobileVisible: false,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: ROUTES.SETTINGS,
    icon: Settings,
    mobileVisible: false,
  },
];
