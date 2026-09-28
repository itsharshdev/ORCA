import React from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileCheck2, 
  Compass, 
  Waves, 
  Wind, 
  Fish, 
  MapPin 
} from 'lucide-react';
import type { DecisionVerdict } from '@/types/marine';

interface WhyDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  verdict?: DecisionVerdict;
  reason?: string;
  confidenceScore?: number;
  vesselName?: string;
  departureTime?: string;
  durationHours?: number;
}

export const WhyDecisionModal: React.FC<WhyDecisionModalProps> = ({
  isOpen,
  onClose,
  verdict = 'CAUTION',
  reason = 'Morning departure window is favorable (1.4m swell), but deteriorating afternoon wave swell (2.1m post-midday) constrains safe return window for Matsya Sagar 1 (1.8m craft limit). Maintain minimum 4.2 km clearance from Naval Anchorage Geofence.',
  vesselName = 'Matsya Sagar 1',
  departureTime = '09:45 IST',
  durationHours = 5,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in select-none">
      <div className="w-full max-w-3xl bg-white border border-[#D8E5EC] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#D8E5EC] flex items-center justify-between bg-[#F5F9FC]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#E8F4FA] border border-[#CFE6F3] text-[#147FB3]">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-telemetry tracking-wider text-[#147FB3] font-bold">
                EXPLAINABLE DECISION AUDIT
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#123B5D] tracking-wide font-display-decision">
                WHY THIS OPERATIONAL VERDICT?
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#587083] hover:text-[#123B5D] hover:bg-[#EDF5F8] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5 bg-white">
          {/* Top Mission Context Header */}
          <div className="p-3.5 rounded-xl bg-[#F5F9FC] border border-[#D8E5EC] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#123B5D]">
              <Compass className="w-4 h-4 text-[#147FB3]" />
              <span>
                <strong>Mission:</strong> {vesselName} ({durationHours} hrs)
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#123B5D]">
              <Clock className="w-4 h-4 text-[#147FB3]" />
              <span>
                <strong>Departure:</strong> {departureTime}
              </span>
            </div>
            <div>
              <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 font-mono text-[11px] font-bold border border-amber-300">
                VERDICT: {verdict} • EVALUATION: DETERMINISTIC
              </span>
            </div>
          </div>

          {/* Primary Reason Callout */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-300/80 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-950 block text-[11px] font-label-caps uppercase mb-0.5 font-bold">
                PRIMARY SYNTHESIS EXPLANATION:
              </strong>
              <p className="leading-relaxed text-[#102B40] font-medium">{reason}</p>
            </div>
          </div>

          {/* Multi-Agent Evidence Streams */}
          <div className="flex flex-col gap-2.5">
            <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider font-label-caps">
              MULTIDISCIPLINARY EVIDENCE BREAKDOWN
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Evidence 1: INCOIS OSF Waves */}
              <div className="p-3.5 rounded-xl bg-[#F5F9FC] border border-[#D8E5EC] flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#123B5D] flex items-center gap-1.5">
                    <Waves className="w-3.5 h-3.5 text-[#147FB3]" />
                    INCOIS Wave Swell
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[9px] font-bold border border-emerald-300">
                    INCOIS OSF • RECORDED SNAPSHOT
                  </span>
                </div>
                <div className="text-[#102B40] font-bold text-sm">
                  1.4m Swell Morning &rarr; 2.1m Midday
                </div>
                <p className="text-[11px] text-[#587083]">
                  Wave height within safe limits (&le; 1.8m) for morning departure; approaches limit by 12:00 IST.
                </p>
              </div>

              {/* Evidence 2: INCOIS PFZ */}
              <div className="p-3.5 rounded-xl bg-[#F5F9FC] border border-[#D8E5EC] flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#123B5D] flex items-center gap-1.5">
                    <Fish className="w-3.5 h-3.5 text-[#2E9B73]" />
                    INCOIS PFZ (Opportunity Only)
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[9px] font-bold border border-emerald-300">
                    INCOIS PFZ • RECORDED SNAPSHOT
                  </span>
                </div>
                <div className="text-[#102B40] font-bold text-sm">
                  Zone Alpha: 18.5 km • 245° WSW
                </div>
                <p className="text-[11px] text-[#587083]">
                  High thermal-chlorophyll front density favorable for pelagic aggregation (Mackerel, Ribbonfish).
                </p>
              </div>

              {/* Evidence 3: PostGIS Geofence */}
              <div className="p-3.5 rounded-xl bg-[#F5F9FC] border border-[#D8E5EC] flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#123B5D] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#147FB3]" />
                    PostGIS Spatial Geofence
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[9px] font-bold border border-blue-300">
                    LOCAL DETERMINISTIC
                  </span>
                </div>
                <div className="text-[#102B40] font-bold text-sm">
                  4.2 km Clearance from Naval Buffer
                </div>
                <p className="text-[11px] text-[#587083]">
                  Planned trajectory corridor does not breach hard exclusion boundaries (&gt; 1.0 km violation buffer).
                </p>
              </div>

              {/* Evidence 4: IMD Marine Warnings */}
              <div className="p-3.5 rounded-xl bg-[#F5F9FC] border border-[#D8E5EC] flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#123B5D] flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-[#D99520]" />
                    IMD Marine Warnings
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-mono text-[9px] font-bold border border-amber-300">
                    IMD • ACCESS PENDING / DEMO SNAPSHOT
                  </span>
                </div>
                <div className="text-[#102B40] font-bold text-sm">
                  Squally wind advisory beyond 25 NM post-midday
                </div>
                <p className="text-[11px] text-[#587083]">
                  Small craft advisory active for afternoon outer shelf. Requires coastal harbor return before squall window.
                </p>
              </div>
            </div>
          </div>

          {/* Deterministic Rules Checklist */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider font-label-caps">
              RULE CONSTRAINT EVALUATION AUDIT
            </div>

            <div className="p-3.5 rounded-xl bg-[#F5F9FC] border border-[#D8E5EC] flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#102B40] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  RULE 01: Severe Cyclone Override
                </span>
                <span className="text-emerald-700 font-bold font-mono text-[11px]">PASSED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#102B40] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  RULE 02: Naval / Sanctuary Geofence Compliance
                </span>
                <span className="text-emerald-700 font-bold font-mono text-[11px]">PASSED (4.2 km)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#102B40] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  RULE 03: Craft Wave Tolerance (&le; 1.4m morning)
                </span>
                <span className="text-emerald-700 font-bold font-mono text-[11px]">PASSED (0.9m)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#102B40] font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  RULE 04: Afternoon Temporal Return Window Exposure
                </span>
                <span className="text-amber-700 font-bold font-mono text-[11px]">CAUTION (2.1m &gt; 12:00)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#102B40] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  RULE 06: PFZ Pelagic Harvest Window
                </span>
                <span className="text-emerald-700 font-bold font-mono text-[11px]">OPPORTUNITY DETECTED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#D8E5EC] bg-[#F5F9FC] flex items-center justify-between text-xs">
          <span className="text-[#587083] font-telemetry">
            ORCA Deterministic Reasoning Pipeline • 100% Audit Traceable
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#147FB3] hover:bg-[#0284C7] text-white font-bold font-label-caps transition cursor-pointer"
          >
            CLOSE AUDIT
          </button>
        </div>
      </div>
    </div>
  );
};
