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
      <header className="h-14 border-b border-[#D8E5EC] bg-white px-3 sm:px-5 flex items-center justify-between z-30 shrink-0 select-none shadow-[0_1px_3px_rgba(18,59,93,0.05)]">
        {/* Left: Brand + Region Switcher */}
        <div className="flex items-center gap-3">
          {/* ORCA Logo Brand */}
          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 pr-3 border-r border-[#D8E5EC] cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#E8F4FA] border border-[#CFE6F3] flex items-center justify-center text-[#147FB3] shadow-sm">
              <Anchor className="w-4 h-4 text-[#147FB3]" />
            </div>
            <div className="flex flex-col">
              <span className="font-display-decision font-black text-base tracking-tight text-[#123B5D]">
                ORCA
              </span>
              <span className="text-[9px] font-semibold text-[#587083] uppercase tracking-wider hidden sm:block">
                Marine Intelligence
              </span>
            </div>
          </div>

          {/* Region Selector */}
          <div className="flex items-center gap-1.5 text-xs font-telemetry text-[#123B5D]">
            <MapPin className="w-3.5 h-3.5 text-[#147FB3] shrink-0" />
            <div className="relative inline-flex items-center">
              <select
                value={activeRegionId}
                onChange={handleRegionChange}
                disabled={isOrchestrating}
                className="bg-[#F5F9FC] border border-[#CBD5E1] hover:border-[#147FB3] rounded-lg py-1 pl-2.5 pr-7 text-xs font-semibold text-[#123B5D] focus:outline-none focus:border-[#147FB3] cursor-pointer appearance-none transition-colors shadow-xs"
              >
                <option value="maharashtra">Maharashtra (Alibaug / Mumbai)</option>
                <option value="tamil_nadu">Tamil Nadu (Nagapattinam / Bay of Bengal)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#587083] absolute right-2 pointer-events-none" />
            </div>

            <span className="hidden lg:inline text-[#587083] font-medium">• {activeRegion.seaBody}</span>
          </div>
        </div>

        {/* Center/Right: Data Health + Role Switcher + Connectivity */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Data Health Pill (Click opens full DataHealthModal) */}
          <button
            onClick={() => setShowHealthModal(true)}
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-95 transition"
            title="Click to inspect live vs fallback data source audit"
          >
            <DataSourceStatusBar />
          </button>

          {/* Role Switcher Pill (Dev / Role Preview Selector) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#CBD5E1] bg-[#F5F9FC] hover:bg-[#E8F4FA] text-xs font-semibold text-[#123B5D] transition cursor-pointer shadow-xs"
              title="Active user perspective (Click to switch workspace)"
            >
              <RoleIcon className="w-3.5 h-3.5 text-[#147FB3]" />
              <span className="font-bold hidden md:inline">{roleConfig.shortLabel}</span>
              <ChevronDown className="w-3 h-3 text-[#587083]" />
            </button>

            {/* Role Switcher Dropdown */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#D8E5EC] rounded-xl shadow-xl p-2 z-50 flex flex-col gap-1 animate-fade-in">
                <div className="px-2.5 py-1.5 text-[10px] font-label-caps text-[#587083] border-b border-[#EDF5F8]">
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
                      className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between transition cursor-pointer ${
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
                            {rConf.tagline}
                          </div>
                        </div>
                      </div>
                      {isCur && <UserCheck className="w-3.5 h-3.5 text-[#147FB3]" />}
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
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
            title={isOnline ? 'Online (Coastal Mesh / 4G / Satellite)' : 'Offline (Local Pre-cached Mode)'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline font-bold">ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline font-bold">OFFLINE</span>
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
