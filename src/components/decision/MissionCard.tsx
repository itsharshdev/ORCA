import React from 'react';
import { Clock, Navigation2, Anchor, ShieldCheck } from 'lucide-react';
import { useRegion } from '@/hooks/useRegion';
import { useOrchestration } from '@/hooks/useOrchestration';

export const MissionCard: React.FC = () => {
  const { activeRegion } = useRegion();
  const { orchestration } = useOrchestration();
  const vessel = activeRegion.vesselsData.profiles[0];
  const planner = orchestration?.planner.data;

  return (
    <div className="hud-glass rounded-xl p-4 flex flex-col gap-3 border border-slate-800/80 shadow-lg select-none">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <span className="text-[10px] font-label-caps text-slate-400 tracking-wider">
          CURRENT MISSION PARAMETERS
        </span>
        <span className="text-[10px] font-telemetry text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
          {activeRegion.shortLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs font-telemetry">
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">PLANNED DEPARTURE</span>
            <span className="font-semibold text-slate-100">{planner?.departureTime || '05:45 IST'}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Navigation2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">MISSION DURATION</span>
            <span className="font-semibold text-slate-100">{planner?.durationHours || 5} HOURS</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Anchor className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">ASSET DEPLOYED</span>
            <span className="font-semibold text-slate-100 truncate block max-w-[110px]" title={vessel.name}>
              {vessel.name} ({vessel.lengthMeters}m)
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">HOME HARBOR</span>
            <span className="font-semibold text-slate-100 truncate block max-w-[110px]" title={vessel.homePort.name}>
              {vessel.homePort.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
