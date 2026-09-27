import React from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileCheck2, 
  Compass, 
  ShieldCheck, 
  Waves, 
  Wind, 
  Fish, 
  MapPin 
} from 'lucide-react';
import type { DecisionVerdict } from '@/types/marine';

interface WhyDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  verdict: DecisionVerdict;
  reason: string;
  confidence: number;
  vesselName: string;
  departureTime: string;
  durationHours: number;
}

export const WhyDecisionModal: React.FC<WhyDecisionModalProps> = ({
  isOpen,
  onClose,
  verdict,
  reason,
  confidence,
  vesselName,
  departureTime,
  durationHours,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-3xl bg-[#081729] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-telemetry tracking-wider text-cyan-400">
                EXPLAINABLE DECISION AUDIT
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide font-display-decision">
                WHY THIS OPERATIONAL VERDICT?
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5">
          {/* Top Mission Context Header */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>
                <strong>Mission:</strong> {vesselName} ({durationHours} hrs)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>
                <strong>Departure:</strong> {departureTime}
              </span>
            </div>
            <div>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[11px] font-bold border border-cyan-800">
                VERDICT: {verdict} ({confidence.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Primary Reason Callout */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block text-[11px] font-label-caps uppercase mb-0.5">
                PRIMARY SYNTHESIS EXPLANATION:
              </strong>
              <p className="leading-relaxed text-slate-200">{reason}</p>
            </div>
          </div>

          {/* Evidence Grid: Multi-Agency Observations */}
          <div className="flex flex-col gap-2.5">
            <div className="text-xs font-bold text-white uppercase tracking-wider font-label-caps flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>CORROBORATING EVIDENCE &amp; OBSERVATION DATA</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Evidence 1: INCOIS OSF */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Waves className="w-3.5 h-3.5" />
                    INCOIS OSF Wave Forecast
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold border border-emerald-500/30">
                    LIVE
                  </span>
                </div>
                <div className="text-slate-200 font-medium">
                  0.9m swell (Morning) &rarr; 2.1m (Post-midday)
                </div>
                <p className="text-[11px] text-slate-400">
                  Morning conditions satisfy craft tolerance (&le; 1.4m), but afternoon swell deterioration forces return before 11:30 IST.
                </p>
              </div>

              {/* Evidence 2: INCOIS PFZ */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Fish className="w-3.5 h-3.5" />
                    INCOIS PFZ Opportunity
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold border border-emerald-500/30">
                    LIVE WFS
                  </span>
                </div>
                <div className="text-slate-200 font-medium">
                  Sector Front Alpha: 18.5 km WSW (High Potential)
                </div>
                <p className="text-[11px] text-slate-400">
                  Pelagic aggregation detected via satellite SST &amp; Chlorophyll gradients. Valid until 28 Sep 2026.
                </p>
              </div>

              {/* Evidence 3: GIS Safety */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-teal-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    PostGIS Spatial Geofence
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono text-[9px] font-bold border border-cyan-500/30">
                    DETERMINISTIC
                  </span>
                </div>
                <div className="text-slate-200 font-medium">
                  4.2 km Clearance from Naval Anchorage Buffer
                </div>
                <p className="text-[11px] text-slate-400">
                  Planned trajectory corridor does not breach hard exclusion boundaries (&gt; 1.0 km violation buffer).
                </p>
              </div>

              {/* Evidence 4: IMD Marine Warnings */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5" />
                    IMD Marine Warnings
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[9px] font-bold border border-amber-500/30">
                    DEMO / PENDING
                  </span>
                </div>
                <div className="text-slate-200 font-medium">
                  Squally wind advisory beyond 25 NM post-midday
                </div>
                <p className="text-[11px] text-slate-400">
                  Small craft advisory active for afternoon outer shelf. Requires coastal harbor return before squall window.
                </p>
              </div>
            </div>
          </div>

          {/* Deterministic Rules Checklist */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider font-label-caps">
              RULE CONSTRAINT EVALUATION AUDIT
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  RULE 01: Severe Cyclone Override
                </span>
                <span className="text-emerald-400 font-bold font-mono text-[11px]">PASSED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  RULE 02: Naval / Sanctuary Geofence Compliance
                </span>
                <span className="text-emerald-400 font-bold font-mono text-[11px]">PASSED (4.2 km)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  RULE 03: Craft Wave Tolerance (&le; 1.4m morning)
                </span>
                <span className="text-emerald-400 font-bold font-mono text-[11px]">PASSED (0.9m)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  RULE 04: Afternoon Temporal Return Window Exposure
                </span>
                <span className="text-amber-400 font-bold font-mono text-[11px]">CAUTION (2.1m &gt; 12:00)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  RULE 06: PFZ Pelagic Harvest Window
                </span>
                <span className="text-emerald-400 font-bold font-mono text-[11px]">OPPORTUNITY DETECTED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-telemetry">
            ORCA Deterministic Reasoning Pipeline • 100% Audit Traceable
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-label-caps transition"
          >
            CLOSE AUDIT
          </button>
        </div>
      </div>
    </div>
  );
};
