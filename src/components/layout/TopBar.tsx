import React, { useState } from 'react';
import { useConnectivity } from '@/hooks/useConnectivity';
import { useRegion } from '@/hooks/useRegion';
import { useOrchestration } from '@/hooks/useOrchestration';
import { useRole } from '@/hooks/useRole';
import { AVAILABLE_ROLES, ROLE_CONFIGS } from '@/config/roles';
import { DataHealthModal } from '@/components/data-status/DataHealthModal';
import { ConnectivityModal } from '@/components/connectivity/ConnectivityModal';
import { OrcaLogo } from '@/components/common/OrcaLogo';
import { 
  Wifi, 
  WifiOff, 
  MapPin, 
  ChevronDown, 
  User, 
  Activity,
  Radio,
  Bell
} from 'lucide-react';
import type { RegionId } from '@/data';
import type { UserRole } from '@/types/contract';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/routes';

export const TopBar: React.FC = () => {
  const { state, isSimulated } = useConnectivity();
  const { activeRegionId, activeRegion, setRegion } = useRegion();
  const { runOrchestration, isOrchestrating } = useOrchestration();
  const { activeRole, roleConfig, setRole } = useRole();
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showConnectivityModal, setShowConnectivityModal] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegionId = e.target.value as RegionId;
    setRegion(newRegionId);
    runOrchestration('Can I go fishing tomorrow morning for five hours?', newRegionId);
  };

  const handleRoleChange = (role: UserRole) => {
    setRole(role);
    setShowRoleMenu(false);
    const targetPath = ROLE_CONFIGS[role]?.defaultPath || ROUTES.DASHBOARD;
    navigate(targetPath);
  };

  const isOffline = state === 'OFFLINE';
  const RoleIcon = roleConfig.icon;

  // Derive human-readable current page title for center/breadcrumbs
  const pageTitles: Record<string, string> = {
    [ROUTES.DASHBOARD]: 'Fisherman Operational Home',
    [ROUTES.ASK]: 'Ask ORCA Intelligence',
    [ROUTES.MISSION]: 'Mission Planner',
    [ROUTES.MAP]: 'Tactical Marine Map',
    [ROUTES.ALERTS]: 'Alert Center',
    [ROUTES.DECISIONS]: 'Decision Explainability',
    [ROUTES.HISTORY]: 'Mission History',
    [ROUTES.AUTHORITY]: 'Coastal Authority Desk',
    [ROUTES.DISASTER]: 'Disaster Management Desk',
    [ROUTES.RESEARCH]: 'Oceanographic Research',
    [ROUTES.OPERATOR]: 'Commercial Fleet Dispatch',
    [ROUTES.PROFILE]: 'User & Vessel Profile',
    [ROUTES.SETTINGS]: 'Settings',
  };
  const currentPageTitle = pageTitles[location.pathname] || 'Marine Intelligence';

  return (
    <>
      <header className="h-14 border-b border-[#D8E5EC] bg-white px-3 sm:px-5 flex items-center justify-between z-30 shrink-0 select-none shadow-[0_1px_3px_rgba(18,59,93,0.04)]">
        {/* Left: Official Brand + Current Workspace Identity */}
        <div className="flex items-center gap-3">
          {/* Official Logo Brand */}
          <div 
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="flex items-center cursor-pointer hover:opacity-90 transition-opacity pr-3 border-r border-[#E2EDF4]"
            title="ORCA Home"
          >
            <OrcaLogo size="sm" showText={true} />
          </div>

          {/* Region Switcher */}
          <div className="flex items-center gap-1.5 text-xs font-telemetry text-[#123B5D]">
            <MapPin className="w-3.5 h-3.5 text-[#147FB3] shrink-0" />
            <div className="relative inline-flex items-center">
              <select
                value={activeRegionId}
                onChange={handleRegionChange}
                disabled={isOrchestrating}
                className="bg-[#F5F9FC] border border-[#CBD5E1] hover:border-[#147FB3] rounded-lg py-1 pl-2.5 pr-7 text-xs font-semibold text-[#123B5D] focus:outline-none focus:border-[#147FB3] cursor-pointer appearance-none transition-colors shadow-2xs"
              >
                <option value="maharashtra">Maharashtra (Alibaug / Mumbai)</option>
                <option value="tamil_nadu">Tamil Nadu (Nagapattinam)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#587083] absolute right-2 pointer-events-none" />
            </div>
            <span className="hidden xl:inline text-[#587083] font-medium">• {activeRegion.seaBody}</span>
          </div>
        </div>

        {/* Center: Contextual Breadcrumb / Page Title (Desktop Only) */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-xs font-bold text-[#123B5D] bg-[#F5F9FC] px-3 py-1 rounded-full border border-[#D8E5EC]">
            {currentPageTitle}
          </span>
        </div>

        {/* Right: Consolidated Controls (Data Health + Role + Connectivity + Profile) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Data Health Single Pill (Click opens full audit modal) */}
          <button
            onClick={() => setShowHealthModal(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-2xs ${
              isOffline
                ? 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                : 'bg-[#EBF7EE] text-[#1B7339] border-[#A3E6B5] hover:bg-[#DEF2E3]'
            }`}
            title="Inspect Data Health & Verification Sources"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`} />
            <span className="hidden sm:inline font-bold font-telemetry">{isOffline ? 'DATA: CACHED' : 'DATA: VERIFIED'}</span>
            <Activity className="w-3.5 h-3.5 sm:hidden" />
          </button>

          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#CBD5E1] bg-[#F5F9FC] hover:bg-[#E8F4FA] text-xs font-semibold text-[#123B5D] transition cursor-pointer shadow-2xs"
              title="Switch Operational Workspace Perspective"
            >
              <RoleIcon className="w-3.5 h-3.5 text-[#147FB3]" />
              <span className="font-bold hidden md:inline">{roleConfig.shortLabel}</span>
              <ChevronDown className="w-3 h-3 text-[#587083]" />
            </button>

            {/* Role Dropdown */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#D8E5EC] rounded-2xl shadow-xl p-2 z-50 flex flex-col gap-1 animate-scale-in">
                <div className="px-2.5 py-1.5 text-[10px] font-label-caps text-[#587083] border-b border-[#EDF5F8] font-bold">
                  OPERATIONAL WORKSPACE
                </div>
                {AVAILABLE_ROLES.map((rKey) => {
                  const rConf = ROLE_CONFIGS[rKey];
                  const Icon = rConf.icon;
                  const isCur = activeRole === rKey;
                  return (
                    <button
                      key={rKey}
                      onClick={() => handleRoleChange(rKey)}
                      className={`w-full p-2 rounded-xl text-left text-xs flex items-center justify-between transition cursor-pointer ${
                        isCur
                          ? 'bg-[#E8F4FA] text-[#123B5D] font-bold border border-[#CFE6F3]'
                          : 'hover:bg-[#F5F9FC] text-[#587083]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-[#147FB3] shrink-0" />
                        <div>
                          <div className="text-xs text-[#123B5D] font-semibold">{rConf.shortLabel}</div>
                          <div className="text-[10px] text-[#587083] font-normal truncate max-w-[140px]">
                            {rConf.description}
                          </div>
                        </div>
                      </div>
                      {isCur && <span className="w-1.5 h-1.5 rounded-full bg-[#147FB3]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Connectivity & GNSS Status */}
          <button
            id="orca-connectivity-status-btn"
            onClick={() => setShowConnectivityModal(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-2xs ${
              isOffline
                ? 'bg-[#FEF1F2] border-[#FCA5A5] text-[#991B1B] hover:bg-[#FEE2E2]'
                : state === 'SAFETY_MESSAGE_RECEIVED'
                ? 'bg-[#EFF6FF] border-[#93C5FD] text-[#1E40AF] hover:bg-[#DBEAFE]'
                : state === 'DEGRADED'
                ? 'bg-[#FEF9EE] border-[#FAD889] text-[#996000] hover:bg-[#FDF0D5]'
                : 'bg-[#F5F9FC] border-[#CBD5E1] text-[#123B5D] hover:bg-[#E8F4FA]'
            }`}
            title="Inspect Network, GNSS Sensor & Radio Status"
          >
            {isOffline ? (
              <WifiOff className="w-3.5 h-3.5 text-[#EF4444]" />
            ) : state === 'SAFETY_MESSAGE_RECEIVED' ? (
              <Radio className="w-3.5 h-3.5 text-[#3B82F6] animate-pulse" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-[#147FB3]" />
            )}

            <span className="font-telemetry font-bold hidden lg:inline">
              {state === 'CONNECTED'
                ? 'ONLINE'
                : state === 'OFFLINE'
                ? 'OFFLINE'
                : state === 'SAFETY_MESSAGE_RECEIVED'
                ? 'SAFETY RX'
                : 'DEGRADED'}
            </span>

            {isSimulated && (
              <span className="hidden xl:inline text-[9px] px-1 bg-amber-100 text-amber-900 rounded font-mono font-bold">
                SIM
              </span>
            )}
          </button>

          {/* Quick Alerts Button */}
          <button
            onClick={() => navigate(ROUTES.ALERTS)}
            className="p-1.5 rounded-lg border border-[#CBD5E1] bg-[#F5F9FC] hover:bg-[#E8F4FA] text-[#123B5D] transition cursor-pointer shadow-2xs relative"
            title="Open Operational Alerts"
          >
            <Bell className="w-3.5 h-3.5 text-[#147FB3]" />
          </button>

          {/* Profile Avatar / Quick Link */}
          <button
            onClick={() => navigate(ROUTES.PROFILE)}
            className="w-7 h-7 rounded-lg bg-[#E8F4FA] border border-[#CFE6F3] flex items-center justify-center text-[#147FB3] hover:border-[#147FB3] transition cursor-pointer shadow-2xs"
            title="User Profile & Assigned Vessel Limits"
          >
            <User className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Popups & Modals */}
      {showHealthModal && (
        <DataHealthModal isOpen={showHealthModal} onClose={() => setShowHealthModal(false)} />
      )}
      {showConnectivityModal && (
        <ConnectivityModal isOpen={showConnectivityModal} onClose={() => setShowConnectivityModal(false)} />
      )}
    </>
  );
};
