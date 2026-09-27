import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home,
  MessageSquareQuote,
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
  Ship,
  User
} from 'lucide-react';
import { ROUTES } from '@/routes';
import { useRole } from '@/hooks/useRole';

export const Sidebar: React.FC = () => {
  const { activeRole } = useRole();

  const primaryModules = [
    { label: 'Fisherman Home', path: ROUTES.DASHBOARD, icon: Home },
    { label: 'Ask ORCA', path: ROUTES.ASK, icon: MessageSquareQuote, tag: 'AI Core' },
    { label: 'Mission Planner', path: ROUTES.MISSION, icon: Navigation2, tag: 'Trip' },
    { label: 'Tactical Marine Map', path: ROUTES.MAP, icon: Map },
    { label: 'Alert Center', path: ROUTES.ALERTS, icon: Bell, tag: 'Alerts' },
    { label: 'Decision Detail', path: ROUTES.DECISIONS, icon: ShieldCheck, tag: 'Audit' },
    { label: 'Mission History', path: ROUTES.HISTORY, icon: History },
  ];

  const roleWorkspaces = [
    { label: 'Fisherman View', path: ROUTES.FISHERMAN, icon: Anchor, role: 'FISHERMAN' },
    { label: 'Coastal Authority', path: ROUTES.AUTHORITY, icon: ShieldAlert, role: 'COASTAL_AUTHORITY' },
    { label: 'Disaster Management', path: ROUTES.DISASTER, icon: Activity, role: 'DISASTER_MANAGER' },
    { label: 'Marine Research', path: ROUTES.RESEARCH, icon: Database, role: 'RESEARCHER' },
    { label: 'Fleet Operator', path: ROUTES.OPERATOR, icon: Ship, role: 'MARITIME_OPERATOR' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#D8E5EC] shrink-0 select-none z-30 shadow-[1px_0_4px_rgba(18,59,93,0.03)]">
      {/* Navigation List */}
      <div className="p-3 flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        {/* Primary Operational Modules */}
        <div className="flex flex-col gap-1">
          <div className="px-3 py-1.5 text-[10px] font-label-caps text-[#7E93A3] tracking-wider font-bold">
            OPERATIONAL MODULES
          </div>

          {primaryModules.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === ROUTES.DASHBOARD}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group
                  ${isActive 
                    ? 'bg-[#E8F4FA] text-[#147FB3] border-l-4 border-[#147FB3] shadow-xs' 
                    : 'text-[#587083] hover:text-[#123B5D] hover:bg-[#F5F9FC] border-l-4 border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>
                {item.tag && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#EDF5F8] text-[#587083] font-telemetry font-bold">
                    {item.tag}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Role Workspaces */}
        <div className="flex flex-col gap-1 pt-3 border-t border-[#EDF5F8]">
          <div className="px-3 py-1 text-[10px] font-label-caps text-[#7E93A3] tracking-wider font-bold">
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
                    ? 'bg-[#E8F4FA] text-[#123B5D] border-l-4 border-[#123B5D] font-bold shadow-xs' 
                    : 'text-[#587083] hover:text-[#123B5D] hover:bg-[#F5F9FC] border-l-4 border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-[#587083] group-hover:text-[#147FB3]" />
                  <span className="truncate">{ws.label}</span>
                </div>
                {isCurrentRole && (
                  <span className="w-2 h-2 rounded-full bg-[#147FB3]" />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Active Vessel Profile Badge */}
      <div className="p-3 mx-3 mb-2 rounded-xl bg-[#F5F9FC] border border-[#D8E5EC] text-xs">
        <div className="flex items-center justify-between text-[10px] font-label-caps text-[#7E93A3] mb-1 font-bold">
          <span className="flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-[#147FB3]" />
            ACTIVE CRAFT
          </span>
          <span className="text-[#147FB3] font-telemetry text-[10px]">WGS84</span>
        </div>
        <div className="font-bold text-[#123B5D] truncate">Matsya Sagar 1</div>
        <div className="text-[11px] text-[#587083] font-telemetry">8.5m • Sassoon Docks Terminal</div>
      </div>

      {/* System Settings & User Profile */}
      <div className="p-3 border-t border-[#EDF5F8] flex flex-col gap-1">
        <NavLink
          to={ROUTES.PROFILE}
          className={({ isActive }) => `
            flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${isActive ? 'text-[#147FB3] font-bold bg-[#E8F4FA]' : 'text-[#587083] hover:text-[#123B5D] hover:bg-[#F5F9FC]'}
          `}
        >
          <User className="w-4 h-4 text-[#587083]" />
          <span>Profile &amp; Vessel</span>
        </NavLink>

        <NavLink
          to={ROUTES.SETTINGS}
          className={({ isActive }) => `
            flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${isActive ? 'text-[#147FB3] font-bold bg-[#E8F4FA]' : 'text-[#587083] hover:text-[#123B5D] hover:bg-[#F5F9FC]'}
          `}
        >
          <Settings className="w-4 h-4 text-[#587083]" />
          <span>System Settings</span>
        </NavLink>

        <NavLink
          to={ROUTES.LOGIN}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-[#7E93A3] hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch Account</span>
        </NavLink>
      </div>
    </aside>
  );
};
