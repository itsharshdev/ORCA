import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home,
  MessageSquareQuote,
  Map, 
  Navigation2, 
  Bell
} from 'lucide-react';
import { ROUTES } from '@/routes';

export const MobileNav: React.FC = () => {
  const navItems = [
    { label: 'Home', path: ROUTES.DASHBOARD, icon: Home },
    { label: 'Ask ORCA', path: ROUTES.ASK, icon: MessageSquareQuote },
    { label: 'Trips', path: ROUTES.MISSION, icon: Navigation2 },
    { label: 'Map', path: ROUTES.MAP, icon: Map },
    { label: 'Alerts', path: ROUTES.ALERTS, icon: Bell },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#D8E5EC] z-50 flex items-center justify-around px-2 select-none shadow-[0_-2px_10px_rgba(18,59,93,0.05)] safe-area-pb">
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
                ? 'text-[#147FB3] bg-[#E8F4FA] font-bold scale-105' 
                : 'text-[#587083] hover:text-[#123B5D]'
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
