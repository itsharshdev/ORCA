import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, GitBranch } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ROUTES } from '@/routes';

interface DecisionCardProps {
  verdict?: 'GO' | 'CAUTION' | 'AVOID';
  confidence?: number;
  summary?: string;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({
  verdict = 'CAUTION',
  confidence = 78,
  summary = 'Conditions are generally favorable for morning departure, but rising wave swell post-12:00 and moderate safety watch affect the planned return corridor.',
}) => {
  return (
    <div className="hud-glass rounded-xl p-4 flex flex-col gap-3 relative border border-amber-500/30 overflow-hidden shadow-xl">
      {/* Left accent border */}
      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#f1c40f]" />

      <div className="flex items-start justify-between pl-2">
        <div>
          <div className="text-[10px] font-label-caps text-slate-400 mb-1">
            OPERATIONAL RECOMMENDATION
          </div>
          <div className="flex items-center gap-3">
            <h3 className="font-display-decision text-3xl font-extrabold text-[#f1c40f] tracking-tight">
              {verdict}
            </h3>
            <StatusBadge status={verdict} size="sm" showPulse />
          </div>
        </div>

        <div className="bg-[#f1c40f]/10 border border-[#f1c40f]/30 px-2.5 py-1 rounded text-right">
          <span className="font-telemetry text-xs font-semibold text-[#f1c40f]">
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
          <span className="text-slate-400">OCEAN SWELL:</span>
          <span className="text-amber-400 font-semibold">1.4m (MOD)</span>
        </div>
        <div className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800/60">
          <span className="text-slate-400">WIND:</span>
          <span className="text-emerald-400 font-semibold">12.5 kts (FAV)</span>
        </div>
        <div className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800/60">
          <span className="text-slate-400">PFZ POTENTIAL:</span>
          <span className="text-emerald-400 font-semibold">HIGH (ZONE A)</span>
        </div>
        <div className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800/60">
          <span className="text-slate-400">GEOFENCE:</span>
          <span className="text-cyan-400 font-semibold">CLEAR (4.2 KM)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pl-2 mt-1">
        <Link
          to={ROUTES.DECISIONS}
          className="flex-1 bg-[#f1c40f]/15 hover:bg-[#f1c40f]/25 text-[#f1c40f] border border-[#f1c40f]/40 py-2 rounded-lg text-xs font-label-caps flex items-center justify-center gap-1.5 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>WHY? (EVIDENCE)</span>
        </Link>
        <Link
          to={ROUTES.MISSION}
          className="flex-1 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 py-2 rounded-lg text-xs font-label-caps flex items-center justify-center gap-1.5 transition-colors"
        >
          <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
          <span>WHAT-IF SIM</span>
        </Link>
      </div>
    </div>
  );
};
