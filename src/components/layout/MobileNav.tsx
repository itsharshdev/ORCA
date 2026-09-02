import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Compass, 
  Map, 
  Navigation2, 
  ShieldCheck, 
  History 
} from 'lucide-react';
import { ROUTES } from '@/routes';

export const MobileNav: React.FC = () => {
  const navItems = [
    { label: 'Status', path: ROUTES.DASHBOARD, icon: Compass },
    { label: 'Trip', path: ROUTES.MISSION, icon: Navigation2 },
    { label: 'Map', path: ROUTES.MAP, icon: Map },
    { label: 'Decision', path: ROUTES.DECISIONS, icon: ShieldCheck },
    { label: 'History', path: ROUTES.HISTORY, icon: History },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 hud-glass border-t border-slate-800/80 z-50 flex items-center justify-around px-2 select-none safe-area-pb">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === ROUTES.DASHBOARD}
            className={({ isActive }) => `
              flex flex-col items-center justify-center w-14 h-12 rounded-xl text-[10px] font-label-caps transition-all
              ${isActive 
                ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-400/30 font-bold scale-105 shadow-[0_0_10px_rgba(70,234,237,0.2)]' 
                : 'text-slate-400 hover:text-slate-200'
              }
            `}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="leading-none">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
