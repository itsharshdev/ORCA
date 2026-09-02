import React from 'react';
import { useConnectivity } from '@/hooks/useConnectivity';
import { useRegion } from '@/hooks/useRegion';
import { useOrchestration } from '@/hooks/useOrchestration';
import { DataFreshnessBadge } from '@/components/ui/DataFreshnessBadge';
import { 
  Wifi, 
  WifiOff, 
  MapPin, 
  Radio, 
  ChevronDown
} from 'lucide-react';
import type { RegionId } from '@/data';

export const TopBar: React.FC = () => {
  const { isOnline } = useConnectivity();
  const { activeRegionId, activeRegion, setRegion } = useRegion();
  const { runOrchestration, isOrchestrating } = useOrchestration();

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegionId = e.target.value as RegionId;
    setRegion(newRegionId);
    runOrchestration('Can I go fishing tomorrow morning for five hours?', newRegionId);
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-[#071424]/95 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Left: Region Telemetry & Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-telemetry text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          
          {/* Subtle Region Selector Dropdown */}
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

        {/* Live Regional Telemetry Status */}
        <div className="hidden xl:flex items-center gap-2 text-[11px] font-telemetry text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800">
          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>DATUM: WGS84 • INCOIS TELEMETRY ACTIVE</span>
        </div>
      </div>

      {/* Right: Connectivity, Freshness Badge, Satellite & Language */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Data Freshness Indicator */}
        <DataFreshnessBadge status="demo_snapshot" />

        {/* Connectivity Status Pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-label-caps border ${
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
  );
};
