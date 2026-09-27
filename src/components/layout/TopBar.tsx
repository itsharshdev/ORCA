import React, { useState } from 'react';
import { useConnectivity } from '@/hooks/useConnectivity';
import { useRegion } from '@/hooks/useRegion';
import { useOrchestration } from '@/hooks/useOrchestration';
import { useRole } from '@/hooks/useRole';
import { AVAILABLE_ROLES, ROLE_CONFIGS } from '@/config/roles';
import { DataHealthModal } from '@/components/data-status/DataHealthModal';
import { DataSourceStatusBar } from '@/components/ui/DataSourceStatusBar';
import { 
  Wifi, 
  WifiOff, 
  MapPin, 
  ChevronDown, 
  Anchor, 
  UserCheck
} from 'lucide-react';
import type { RegionId } from '@/data';
import type { UserRole } from '@/types/contract';
import { useNavigate } from 'react-router-dom';

export const TopBar: React.FC = () => {
  const { isOnline } = useConnectivity();
  const { activeRegionId, activeRegion, setRegion } = useRegion();
  const { runOrchestration, isOrchestrating } = useOrchestration();
  const { activeRole, roleConfig, setRole } = useRole();
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const navigate = useNavigate();

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegionId = e.target.value as RegionId;
    setRegion(newRegionId);
    runOrchestration('Can I go fishing tomorrow morning for five hours?', newRegionId);
  };

  const handleRoleChange = (role: UserRole) => {
    setRole(role);
    setShowRoleMenu(false);
    const targetPath = ROLE_CONFIGS[role]?.defaultPath || '/dashboard';
    navigate(targetPath);
  };

  const RoleIcon = roleConfig.icon;

  return (
    <>
      <header className="h-14 border-b border-slate-800 bg-[#071424]/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-30 shrink-0 select-none">
        {/* Left: Brand + Region Switcher */}
        <div className="flex items-center gap-3">
          {/* ORCA Logo Brand */}
          <div className="flex items-center gap-2 pr-2 border-r border-slate-800 hidden sm:flex">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Anchor className="w-4 h-4" />
            </div>
            <span className="font-display-decision font-bold text-sm tracking-wider text-white">
              ORCA
            </span>
          </div>

          {/* Region Selector */}
          <div className="flex items-center gap-1.5 text-xs font-telemetry text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="relative inline-flex items-center">
              <select
                value={activeRegionId}
                onChange={handleRegionChange}
                disabled={isOrchestrating}
                className="bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 rounded-lg py-1 pl-2.5 pr-7 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer appearance-none transition-colors"
              >
                <option value="maharashtra">Maharashtra (Alibaug / Mumbai)</option>
                <option value="tamil_nadu">Tamil Nadu (Nagapattinam / Bay of Bengal)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2 pointer-events-none" />
            </div>

            <span className="hidden lg:inline text-slate-500">• {activeRegion.seaBody}</span>
          </div>
        </div>

        {/* Center/Right: Data Health + Role Switcher + Connectivity */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Data Health Pill (Click opens full DataHealthModal) */}
          <button
            onClick={() => setShowHealthModal(true)}
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition"
            title="Click to inspect live vs fallback data source audit"
          >
            <DataSourceStatusBar />
          </button>

          {/* Role Switcher Pill (Dev / Role Preview Selector) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-label-caps transition cursor-pointer ${roleConfig.badgeStyle}`}
              title="Active user perspective (Click to switch workspace)"
            >
              <RoleIcon className="w-3.5 h-3.5" />
              <span className="font-bold hidden md:inline">{roleConfig.shortLabel}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {/* Role Switcher Dropdown */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0b1b30] border border-slate-700 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 animate-fade-in">
                <div className="px-2.5 py-1.5 text-[10px] font-label-caps text-slate-400 border-b border-slate-800">
                  SWITCH OPERATIONAL ROLE
                </div>
                {AVAILABLE_ROLES.map((rKey) => {
                  const rConf = ROLE_CONFIGS[rKey];
                  const Icon = rConf.icon;
                  const isCur = activeRole === rKey;
                  return (
                    <button
                      key={rKey}
                      onClick={() => handleRoleChange(rKey)}
                      className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between transition ${
                        isCur
                          ? 'bg-cyan-500/20 text-white font-bold border border-cyan-500/40'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div>
                          <div className="text-xs">{rConf.shortLabel}</div>
                          <div className="text-[10px] text-slate-400 font-normal truncate max-w-[140px]">
                            {rConf.tagline}
                          </div>
                        </div>
                      </div>
                      {isCur && <UserCheck className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Device Connectivity Status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-label-caps border ${
              isOnline
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                : 'bg-rose-950/40 text-rose-400 border-rose-800/40'
            }`}
            title={isOnline ? 'Online (Coastal Mesh / 4G / Satellite)' : 'Offline (Local Pre-cached Mode)'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">OFFLINE</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Global Data Health Verification Modal */}
      <DataHealthModal
        isOpen={showHealthModal}
        onClose={() => setShowHealthModal(false)}
      />
    </>
  );
};
