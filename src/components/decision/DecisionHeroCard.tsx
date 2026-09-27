import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  ChevronRight, 
  Map, 
  ShieldCheck,
  Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes';
import { WhyDecisionModal } from './WhyDecisionModal';
import { useOrchestration } from '@/hooks/useOrchestration';
import type { DecisionVerdict } from '@/types/marine';

interface DecisionHeroCardProps {
  verdict?: DecisionVerdict;
  confidence?: number;
  reason?: string;
  recommendation?: string;
  departureTime?: string;
  durationHours?: number;
  vesselName?: string;
  className?: string;
}

export const DecisionHeroCard: React.FC<DecisionHeroCardProps> = ({
  verdict = 'CAUTION',
  confidence = 78.4,
  reason = 'Morning departure is favorable (< 1.2m swell), but deteriorating afternoon wave swell (> 2.1m post-12:00 IST) constrains safe return window. Maintain minimum 4.2 km clearance from Naval Anchorage Geofence.',
  recommendation = 'Plan return to Sassoon Docks before 11:30 IST. Maintain active VHF watch on Channel 16.',
  departureTime = '05:45 IST',
  durationHours = 5,
  vesselName = 'Matsya Sagar 1',
  className = '',
}) => {
  const [showWhyModal, setShowWhyModal] = useState(false);
  const { orchestration } = useOrchestration();

  const activeVerdict = orchestration?.decision?.verdict || verdict;
  const activeConfidence = orchestration?.decision?.confidenceScore || confidence;
  const activeReason = orchestration?.decision?.explanation || reason;

  const getVerdictTheme = () => {
    switch (activeVerdict) {
      case 'GO':
        return {
          title: 'VOYAGE CLEAR',
          subtitle: 'Favorable Sea & Wind Conditions',
          badgeText: 'GO — CLEARANCE GRANTED',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
          cardBorder: 'border-emerald-500/50 shadow-[0_0_24px_rgba(46,204,113,0.15)]',
          bannerBg: 'bg-emerald-950/40',
          textColor: 'text-emerald-400',
          Icon: CheckCircle2,
        };
      case 'CAUTION':
        return {
          title: 'PROCEED WITH CAUTION',
          subtitle: 'Window & Proximity Constraints Active',
          badgeText: 'CAUTION — ADVISORY ACTIVE',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          cardBorder: 'border-amber-500/50 shadow-[0_0_24px_rgba(241,196,15,0.15)]',
          bannerBg: 'bg-amber-950/40',
          textColor: 'text-amber-400',
          Icon: AlertTriangle,
        };
      case 'AVOID':
        return {
          title: 'VOYAGE RESTRICTED',
          subtitle: 'Safety Hazard / Boundary Violation',
          badgeText: 'AVOID — CLEARANCE DENIED',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
          cardBorder: 'border-rose-500/50 shadow-[0_0_24px_rgba(231,76,60,0.2)]',
          bannerBg: 'bg-rose-950/40',
          textColor: 'text-rose-400',
          Icon: XCircle,
        };
      default:
        return {
          title: 'CHECK REQUIRED',
          subtitle: 'Insufficient Spatial / Weather Data',
          badgeText: 'INSUFFICIENT DATA',
          badgeBg: 'bg-slate-700/40 text-slate-300 border-slate-600',
          cardBorder: 'border-slate-700',
          bannerBg: 'bg-slate-900/60',
          textColor: 'text-slate-300',
          Icon: HelpCircle,
        };
    }
  };

  const theme = getVerdictTheme();
  const Icon = theme.Icon;

  return (
    <>
      <div
        className={`hud-glass rounded-2xl p-5 sm:p-6 border flex flex-col gap-4 relative overflow-hidden transition-all ${theme.cardBorder} ${className}`}
      >
        {/* Accent Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

        {/* Top Header: Vessel & Departure Context */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-telemetry tracking-wider text-slate-400">
                OPERATIONAL MISSION DECISION
              </div>
              <h2 className="text-sm font-bold text-white tracking-wide font-display-decision">
                {vesselName} • {durationHours} hr voyage
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold font-telemetry text-cyan-300 block">
              {departureTime}
            </span>
            <span className="text-[10px] text-slate-400 font-telemetry">
              Confidence: {activeConfidence.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Decision Hero Status */}
        <div className={`p-4 rounded-xl border flex items-start gap-4 ${theme.bannerBg} ${theme.badgeBg}`}>
          <Icon className={`w-8 h-8 ${theme.textColor} shrink-0 mt-0.5`} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className={`text-xl sm:text-2xl font-black tracking-tight font-display-decision ${theme.textColor}`}>
                {theme.title}
              </h1>
              <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono tracking-wider uppercase border ${theme.badgeBg}`}>
                {activeVerdict}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium leading-relaxed">
              {activeReason}
            </p>
          </div>
        </div>

        {/* Actionable Operational Advice */}
        {recommendation && (
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-cyan-300 block text-[11px] font-label-caps uppercase">
                RECOMMENDED OPERATIONAL ACTION:
              </strong>
              {recommendation}
            </div>
          </div>
        )}

        {/* Interactive Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between pt-1 gap-2 border-t border-slate-800/80">
          <button
            onClick={() => setShowWhyModal(true)}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-xs font-label-caps tracking-wider transition flex items-center gap-1.5 shadow-sm"
          >
            <span>WHY THIS DECISION?</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <Link
            to={ROUTES.MAP}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-label-caps tracking-wider transition flex items-center gap-1.5 shadow-md"
          >
            <Map className="w-4 h-4" />
            <span>INSPECT ROUTE ON MAP</span>
          </Link>
        </div>
      </div>

      {/* Explainable Decision Evidence Modal */}
      <WhyDecisionModal
        isOpen={showWhyModal}
        onClose={() => setShowWhyModal(false)}
        verdict={activeVerdict}
        reason={activeReason}
        confidence={activeConfidence}
        vesselName={vesselName}
        departureTime={departureTime}
        durationHours={durationHours}
      />
    </>
  );
};
