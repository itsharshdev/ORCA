import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Anchor, 
  Wifi, 
  WifiOff, 
  MapPin, 
  Globe, 
  User, 
  Satellite
} from 'lucide-react';
import { ROUTES } from '@/routes';
import { APP_NAME } from '@/lib/constants';
import { useConnectivity } from '@/hooks/useConnectivity';
import { DataFreshnessBadge } from '@/components/ui/DataFreshnessBadge';

export const TopBar: React.FC = () => {
  const { isOnline } = useConnectivity();
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case ROUTES.DASHBOARD:
        return 'Command Center';
      case ROUTES.MISSION:
        return 'Mission Planner';
      case ROUTES.MAP:
        return 'Marine Map Explorer';
      case ROUTES.DECISIONS:
        return 'Decision Intelligence';
      case ROUTES.HISTORY:
        return 'Mission Audit History';
      case ROUTES.SETTINGS:
        return 'System Settings';
      default:
        return 'Command Center';
    }
  };

  return (
    <header className="h-16 w-full hud-glass border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between shrink-0 z-40">
      {/* Brand & Active Route Header */}
      <div className="flex items-center gap-3 sm:gap-6">
        <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors">
            <Anchor className="w-5 h-5" />
          </div>
          <span className="font-display-decision text-xl font-bold tracking-wider text-white">
            {APP_NAME}
          </span>
        </Link>

        <div className="hidden sm:block h-5 w-px bg-slate-800" />

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">CONSOLE /</span>
          <span className="text-xs font-semibold text-cyan-400 font-label-caps">
            {getPageTitle(location.pathname)}
          </span>
        </div>
      </div>

      {/* Telemetry, Status & Profile Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Regional Telemetry */}
        <div className="hidden xl:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded text-xs">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="font-telemetry text-slate-300 text-[11px]">
            18°54'N, 72°49'E • ARABIAN SEA
          </span>
        </div>

        {/* Connectivity Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-[11px] font-label-caps">
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Wifi className="w-3.5 h-3.5 text-emerald-400 hidden sm:inline" />
              <span className="text-emerald-400">CONNECTED</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <WifiOff className="w-3.5 h-3.5 text-amber-400 hidden sm:inline" />
              <span className="text-amber-400">OFFLINE</span>
            </>
          )}
        </div>

        {/* Demo Snapshot Tag */}
        <div className="hidden md:block">
          <DataFreshnessBadge status="demo_snapshot" />
        </div>

        {/* Utility Shortcuts */}
        <div className="flex items-center gap-1">
          <button 
            type="button"
            title="Satellite Feed (Simulated)"
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors"
          >
            <Satellite className="w-4 h-4" />
          </button>
          <button 
            type="button"
            title="Language: English (EN / HI / MR)"
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors"
          >
            <Globe className="w-4 h-4" />
          </button>
          <Link 
            to={ROUTES.SETTINGS} 
            title="Vessel & Operator Profile"
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors"
          >
            <User className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};
