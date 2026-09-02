import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, GitBranch, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useOrchestration } from '@/hooks/useOrchestration';
import { ROUTES } from '@/routes';

export const DecisionCard: React.FC = () => {
  const { orchestration } = useOrchestration();
  const decision = orchestration?.decision;

  const verdict = decision?.verdict || 'CAUTION';
  const confidence = decision?.confidenceScore || 78.4;
  const summary = decision?.explanation || 'Conditions are generally favorable for morning departure, but rising wave swell post-12:00 and moderate safety watch affect the planned return corridor.';
  const topZoneName = decision?.recommendedZone?.name || 'Alibaug Outer Bank (PFZ-MUM-01)';

  return (
    <div className={`hud-glass rounded-xl p-4 flex flex-col gap-3 relative border overflow-hidden shadow-xl ${
      verdict === 'GO' 
        ? 'border-emerald-500/40' 
        : verdict === 'CAUTION' 
        ? 'border-amber-500/40' 
        : 'border-rose-500/40'
    }`}>
      {/* Left accent border */}
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
        verdict === 'GO' 
          ? 'bg-[#2ecc71]' 
          : verdict === 'CAUTION' 
          ? 'bg-[#f1c40f]' 
          : 'bg-[#e74c3c]'
      }`} />

      <div className="flex items-start justify-between pl-2">
        <div>
          <div className="text-[10px] font-label-caps text-slate-400 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>OPERATIONAL RECOMMENDATION</span>
          </div>
          <div className="flex items-center gap-3">
            <h3 className={`font-display-decision text-3xl font-extrabold tracking-tight ${
              verdict === 'GO' 
                ? 'text-[#2ecc71]' 
                : verdict === 'CAUTION' 
                ? 'text-[#f1c40f]' 
                : 'text-[#e74c3c]'
            }`}>
              {verdict}
            </h3>
            <StatusBadge status={verdict} size="sm" showPulse />
          </div>
        </div>

        <div className={`border px-2.5 py-1 rounded text-right ${
          verdict === 'GO' 
            ? 'bg-[#2ecc71]/10 border-[#2ecc71]/30 text-[#2ecc71]' 
            : verdict === 'CAUTION' 
            ? 'bg-[#f1c40f]/10 border-[#f1c40f]/30 text-[#f1c40f]' 
            : 'bg-[#e74c3c]/10 border-[#e74c3c]/30 text-[#e74c3c]'
        }`}>
          <span className="font-telemetry text-xs font-semibold">
            {confidence}% CONFIDENCE
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-300 pl-2 leading-relaxed border-t border-slate-800/80 pt-2.5 font-sans">
        {summary}
      </p>

      {/* Supporting Signals Snapshot */}
      <div className="grid grid-cols-2 gap-2 pl-2 text-[11px] font-telemetry">
        <div className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800/60">
          <span className="text-slate-400">TARGET ZONE:</span>
          <span className="text-emerald-400 font-semibold truncate max-w-[110px]">{topZoneName}</span>
        </div>
        <div className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800/60">
          <span className="text-slate-400">WINDOW:</span>
          <span className="text-cyan-300 font-semibold">{decision?.recommendedDeparture || '05:45'} - {decision?.recommendedReturn || '10:45'}</span>
        </div>
        <div className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800/60">
          <span className="text-slate-400">OCEAN SWELL:</span>
          <span className="text-amber-400 font-semibold">{orchestration?.ocean.data.waveSwellMeters || 1.4}m</span>
        </div>
        <div className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800/60">
          <span className="text-slate-400">GEOFENCE:</span>
          <span className="text-cyan-400 font-semibold">{orchestration?.geoSafety.data.geofenceClearanceKm || 4.2} KM CLEAR</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pl-2 mt-1">
        <Link
          to={ROUTES.DECISIONS}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 rounded-lg text-xs font-label-caps flex items-center justify-center gap-1.5 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>WHY? (EVIDENCE)</span>
        </Link>
        <Link
          to={ROUTES.MISSION}
          className="flex-1 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 py-2 rounded-lg text-xs font-label-caps flex items-center justify-center gap-1.5 transition-colors"
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>PLAN TRIP</span>
        </Link>
      </div>
    </div>
  );
};
