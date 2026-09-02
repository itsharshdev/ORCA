import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Compass, 
  Map, 
  Navigation2, 
  ShieldCheck, 
  History, 
  Settings, 
  LogOut,
  SlidersHorizontal
} from 'lucide-react';
import { ROUTES } from '@/routes';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Command Center', path: ROUTES.DASHBOARD, icon: Compass },
  { label: 'Mission Planner', path: ROUTES.MISSION, icon: Navigation2, tag: 'Trip' },
  { label: 'Marine Map', path: ROUTES.MAP, icon: Map },
  { label: 'Decisions', path: ROUTES.DECISIONS, icon: ShieldCheck, tag: 'AI' },
  { label: 'Mission History', path: ROUTES.HISTORY, icon: History },
  { label: 'System Settings', path: ROUTES.SETTINGS, icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 hud-glass border-r border-slate-800/80 shrink-0 select-none z-30">
      {/* Navigation List */}
      <div className="p-3 flex-1 flex flex-col gap-1.5">
        <div className="px-3 py-2 text-[10px] font-label-caps text-slate-500 tracking-wider">
          PRIMARY MODULES
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === ROUTES.DASHBOARD}
              className={({ isActive }) => `
                flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group
                ${isActive 
                  ? 'bg-cyan-500/15 text-cyan-300 border-l-4 border-cyan-400 font-semibold shadow-[inset_0_0_12px_rgba(70,234,237,0.1)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-4 border-transparent'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              {item.tag && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-telemetry">
                  {item.tag}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Vessel Quick Telemetry Summary */}
      <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
        <div className="flex items-center justify-between text-[11px] font-label-caps text-slate-400 mb-1.5">
          <span className="flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
            VESSEL PROFILE
          </span>
          <span className="text-cyan-400 font-telemetry text-[10px]">ACTIVE</span>
        </div>
        <div className="font-semibold text-slate-200 truncate">Matsya Sagar 1</div>
        <div className="text-[11px] text-slate-400 font-telemetry mt-0.5">8.5m • Sassoon Docks</div>
      </div>

      {/* Sign In / Sign Out Action */}
      <div className="p-3 border-t border-slate-800/60">
        <NavLink
          to={ROUTES.LOGIN}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit / Switch Account</span>
        </NavLink>
      </div>
    </aside>
  );
};
