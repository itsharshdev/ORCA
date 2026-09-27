import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Compass, 
  Map, 
  Navigation2, 
  ShieldCheck, 
  History, 
  Settings, 
  Bell,
  LogOut,
  SlidersHorizontal,
  Anchor,
  ShieldAlert,
  Activity,
  Database,
  Ship
} from 'lucide-react';
import { ROUTES } from '@/routes';
import { useRole } from '@/hooks/useRole';

export const Sidebar: React.FC = () => {
  const { activeRole } = useRole();

  const primaryModules = [
    { label: 'Status & Home', path: ROUTES.DASHBOARD, icon: Compass },
    { label: 'Trip Planner', path: ROUTES.MISSION, icon: Navigation2, tag: 'Plan' },
    { label: 'Marine Map', path: ROUTES.MAP, icon: Map },
    { label: 'Alert Center', path: ROUTES.ALERTS, icon: Bell, tag: 'Live' },
    { label: 'Decision Audit', path: ROUTES.DECISIONS, icon: ShieldCheck, tag: 'Rules' },
    { label: 'Mission History', path: ROUTES.HISTORY, icon: History },
  ];

  const roleWorkspaces = [
    { label: 'Fisherman Workspace', path: ROUTES.FISHERMAN, icon: Anchor, role: 'FISHERMAN' },
    { label: 'Coastal Authority', path: ROUTES.AUTHORITY, icon: ShieldAlert, role: 'COASTAL_AUTHORITY' },
    { label: 'Disaster Mgmt (NDRF)', path: ROUTES.DISASTER, icon: Activity, role: 'DISASTER_MANAGER' },
    { label: 'Marine Research', path: ROUTES.RESEARCHER, icon: Database, role: 'RESEARCHER' },
    { label: 'Maritime Operator', path: ROUTES.OPERATOR, icon: Ship, role: 'MARITIME_OPERATOR' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 hud-glass border-r border-slate-800/80 shrink-0 select-none z-30">
      {/* Navigation List */}
      <div className="p-3 flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        {/* Primary Operational Modules */}
        <div className="flex flex-col gap-1">
          <div className="px-3 py-1 text-[10px] font-label-caps text-slate-500 tracking-wider">
            PRIMARY MODULES
          </div>

          {primaryModules.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === ROUTES.DASHBOARD}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all group
                  ${isActive 
                    ? 'bg-cyan-500/15 text-cyan-300 border-l-4 border-cyan-400 font-semibold shadow-[inset_0_0_12px_rgba(70,234,237,0.1)]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-4 border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>
                {item.tag && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-telemetry">
                    {item.tag}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Role Workspaces */}
        <div className="flex flex-col gap-1 pt-2 border-t border-slate-800/80">
          <div className="px-3 py-1 text-[10px] font-label-caps text-slate-500 tracking-wider">
            ROLE WORKSPACES
          </div>

          {roleWorkspaces.map((ws) => {
            const Icon = ws.icon;
            const isCurrentRole = activeRole === ws.role;
            return (
              <NavLink
                key={ws.path}
                to={ws.path}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all group
                  ${isActive 
                    ? 'bg-purple-500/15 text-purple-300 border-l-4 border-purple-400 font-semibold shadow-[inset_0_0_12px_rgba(168,85,247,0.1)]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-4 border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                  <span className="truncate">{ws.label}</span>
                </div>
                {isCurrentRole && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Vessel Quick Profile Telemetry */}
      <div className="p-3 mx-3 mb-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
        <div className="flex items-center justify-between text-[11px] font-label-caps text-slate-400 mb-1">
          <span className="flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
            ACTIVE CRAFT
          </span>
          <span className="text-cyan-400 font-telemetry text-[10px]">WGS84</span>
        </div>
        <div className="font-semibold text-slate-200 truncate">Matsya Sagar 1</div>
        <div className="text-[11px] text-slate-400 font-telemetry">8.5m • Sassoon Docks Terminal</div>
      </div>

      {/* System Settings & Sign Out */}
      <div className="p-3 border-t border-slate-800/60 flex flex-col gap-1">
        <NavLink
          to={ROUTES.SETTINGS}
          className={({ isActive }) => `
            flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors
            ${isActive ? 'text-cyan-300 font-bold bg-cyan-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}
          `}
        >
          <Settings className="w-4 h-4" />
          <span>System Settings</span>
        </NavLink>

        <NavLink
          to={ROUTES.LOGIN}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit / Switch Account</span>
        </NavLink>
      </div>
    </aside>
  );
};
