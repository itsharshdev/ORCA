import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home,
  MessageSquareQuote,
  Map, 
  Navigation2, 
  MoreHorizontal,
  Bell,
  ShieldCheck,
  History,
  User,
  Settings,
  X,
  Anchor,
  ShieldAlert,
  Activity,
  Database,
  Ship
} from 'lucide-react';
import { ROUTES } from '@/routes';
import { useRole } from '@/hooks/useRole';

export const MobileNav: React.FC = () => {
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const { activeRole, setRole } = useRole();
  const navigate = useNavigate();

  const primaryItems = [
    { label: 'Home', path: ROUTES.DASHBOARD, icon: Home },
    { label: 'Ask ORCA', path: ROUTES.ASK, icon: MessageSquareQuote },
    { label: 'Mission', path: ROUTES.MISSION, icon: Navigation2 },
    { label: 'Map', path: ROUTES.MAP, icon: Map },
  ];

  const secondaryItems = [
    { label: 'Alert Center', path: ROUTES.ALERTS, icon: Bell },
    { label: 'Decision Detail', path: ROUTES.DECISIONS, icon: ShieldCheck },
    { label: 'Mission History', path: ROUTES.HISTORY, icon: History },
    { label: 'Profile & Craft', path: ROUTES.PROFILE, icon: User },
    { label: 'System Settings', path: ROUTES.SETTINGS, icon: Settings },
  ];

  const roleWorkspaces = [
    { label: 'Fisherman View', path: ROUTES.DASHBOARD, icon: Anchor, role: 'FISHERMAN' },
    { label: 'Coastal Authority', path: ROUTES.AUTHORITY, icon: ShieldAlert, role: 'COASTAL_AUTHORITY' },
    { label: 'Disaster Management', path: ROUTES.DISASTER, icon: Activity, role: 'DISASTER_MANAGER' },
    { label: 'Marine Research', path: ROUTES.RESEARCH, icon: Database, role: 'RESEARCHER' },
    { label: 'Fleet Operator', path: ROUTES.OPERATOR, icon: Ship, role: 'MARITIME_OPERATOR' },
  ];

  return (
    <>
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#DCE6ED] z-50 flex items-center justify-around px-2 select-none shadow-[0_-4px_20px_rgba(18,59,93,0.08)]"
        style={{
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
          paddingTop: '0.375rem',
        }}
      >
        {primaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === ROUTES.DASHBOARD}
              onClick={() => setShowMoreDrawer(false)}
              className={({ isActive }) => `
                flex-1 flex flex-col items-center justify-center max-w-[4.8rem] py-1 transition-all cursor-pointer group
                ${isActive ? 'text-[#0284C7]' : 'text-[#64748B] hover:text-[#123B5D]'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div 
                    className={`w-11 h-7 rounded-full flex items-center justify-center mb-0.5 transition-all ${
                      isActive 
                        ? 'bg-[#E0F2FE] text-[#0284C7] shadow-2xs font-bold' 
                        : 'text-[#64748B] group-hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <span className={`text-[10px] leading-tight tracking-tight ${isActive ? 'font-bold text-[#0284C7]' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* More Button */}
        <button
          type="button"
          onClick={() => setShowMoreDrawer(!showMoreDrawer)}
          className={`flex-1 flex flex-col items-center justify-center max-w-[4.8rem] py-1 transition-all cursor-pointer group ${
            showMoreDrawer ? 'text-[#0284C7]' : 'text-[#64748B] hover:text-[#123B5D]'
          }`}
        >
          <div 
            className={`w-11 h-7 rounded-full flex items-center justify-center mb-0.5 transition-all ${
              showMoreDrawer 
                ? 'bg-[#E0F2FE] text-[#0284C7] shadow-2xs' 
                : 'text-[#64748B] group-hover:bg-slate-100'
            }`}
          >
            <MoreHorizontal className="w-4 h-4 shrink-0" />
          </div>
          <span className={`text-[10px] leading-tight tracking-tight ${showMoreDrawer ? 'font-bold text-[#0284C7]' : 'font-medium'}`}>
            More
          </span>
        </button>
      </nav>

      {/* More Drawer Sheet */}
      {showMoreDrawer && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-[#102B40]/60 backdrop-blur-xs flex flex-col justify-end animate-fade-in select-none"
          onClick={() => setShowMoreDrawer(false)}
        >
          <div 
            className="bg-white rounded-t-3xl border-t border-[#D8E5EC] p-5 max-h-[82vh] overflow-y-auto flex flex-col gap-4 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto -mt-1 mb-1 shrink-0" />

            <div className="flex items-center justify-between pb-3 border-b border-[#EDF5F8]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
                Navigation &amp; Workspaces
              </span>
              <button
                type="button"
                onClick={() => setShowMoreDrawer(false)}
                className="p-1.5 rounded-lg text-[#587083] hover:text-[#123B5D] hover:bg-[#F5F9FC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Secondary Modules */}
            <div className="flex flex-col gap-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#7E93A3] mb-1">
                OPERATIONAL MODULES
              </div>
              <div className="grid grid-cols-2 gap-2">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => {
                        setShowMoreDrawer(false);
                        navigate(item.path);
                      }}
                      className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#E0F2FE] border border-[#E2E8F0] hover:border-[#38BDF8] flex items-center gap-2 text-xs font-bold text-[#123B5D] cursor-pointer transition text-left"
                    >
                      <Icon className="w-4 h-4 text-[#0284C7] shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role Workspaces */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#EDF5F8]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#7E93A3] mb-1">
                OPERATIONAL ROLES
              </div>
              <div className="flex flex-col gap-1.5">
                {roleWorkspaces.map((rw) => {
                  const Icon = rw.icon;
                  const isCurrentRole = activeRole === rw.role;
                  return (
                    <button
                      key={rw.role}
                      type="button"
                      onClick={() => {
                        setRole(rw.role as any);
                        setShowMoreDrawer(false);
                        navigate(rw.path);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition ${
                        isCurrentRole
                          ? 'bg-[#E0F2FE] border-[#0284C7] text-[#0369A1] font-bold shadow-2xs'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#587083] hover:text-[#123B5D]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 shrink-0 ${isCurrentRole ? 'text-[#0284C7]' : 'text-slate-500'}`} />
                        <span>{rw.label}</span>
                      </div>
                      {isCurrentRole && <span className="w-2 h-2 rounded-full bg-[#0284C7]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
