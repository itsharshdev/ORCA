import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  Cpu, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';

export const AnalysisTraceAccordion: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const traces = [
    {
      agent: 'Planner Agent',
      domain: 'Mission Routing & Spatio-Temporal Envelope',
      status: 'completed',
      latency: '142ms',
      summary: 'Constructed 5-hour route corridor from Sassoon Docks to PFZ Alpha Sector (18.78°N, 72.72°E).',
    },
    {
      agent: 'Oceanography Agent',
      domain: 'INCOIS Ocean State Forecast (OSF)',
      status: 'completed',
      latency: '280ms',
      summary: 'Verified 0.9m significant wave height and 28.4°C SST. Identified afternoon swell surge to 2.1m.',
    },
    {
      agent: 'Meteorology Agent',
      domain: 'IMD Coastal Weather & Marine Warnings',
      status: 'completed',
      latency: '190ms',
      summary: 'Processed coastal wind vectors (11 kts) and squall line warning for outer continental shelf.',
    },
    {
      agent: 'Fisheries Utility Agent',
      domain: 'INCOIS Potential Fishing Zones (PFZ)',
      status: 'completed',
      latency: '310ms',
      summary: 'Corroborated thermal front and chlorophyll boundary (1.82 mg/m³). Scored spatial relevance at 88/100.',
    },
    {
      agent: 'Geospatial Safety Agent',
      domain: 'PostGIS Geofence & Boundary Buffer',
      status: 'completed',
      latency: '165ms',
      summary: 'Evaluated 4.2 km clearance from Naval Anchorage Geofence. Verified no hard polygon incursion.',
    },
    {
      agent: 'Synthesis Engine',
      domain: 'Deterministic Constraint Evaluation',
      status: 'completed',
      latency: '95ms',
      summary: 'Applied deterministic safety precedence rules. Issued CAUTION verdict constrained by afternoon wave window.',
    },
  ];

  return (
    <div className={`bg-white rounded-2xl border border-[#D8E5EC] shadow-sm overflow-hidden transition select-none ${className}`}>
      {/* Accordion Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between bg-[#F5F9FC] hover:bg-[#EDF5F8] transition text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#E8F4FA] border border-[#CFE6F3] text-[#147FB3]">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#123B5D] tracking-tight uppercase font-label-caps">
                Technical Reasoning &amp; Analysis Trace
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-[#147FB3] text-[10px] font-mono font-bold border border-[#CFE6F3]">
                AUDIT LOG
              </span>
            </div>
            <p className="text-[11px] text-[#587083] mt-0.5">
              Multi-agent reasoning pipeline &amp; deterministic handoff telemetry (Inspect for technical review)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#587083]">
          <span className="text-xs font-semibold hidden sm:inline">
            {isOpen ? 'Collapse Trace' : 'Expand Trace'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-[#147FB3]" /> : <ChevronDown className="w-4 h-4 text-[#587083]" />}
        </div>
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-4 sm:p-5 bg-white border-t border-[#D8E5EC] flex flex-col gap-3 animate-fade-in text-xs">
          <div className="flex items-center justify-between text-[11px] text-[#587083] pb-2 border-b border-[#EDF5F8]">
            <span className="flex items-center gap-1.5 font-telemetry">
              <Terminal className="w-3.5 h-3.5 text-[#147FB3]" />
              ORCA Multi-Agent Pipeline • Deterministic Consensus
            </span>
            <span className="font-telemetry font-bold text-[#123B5D]">6/6 SPECIALISTS VERIFIED</span>
          </div>

          <div className="flex flex-col gap-2">
            {traces.map((t, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#F5F9FC] border border-[#D8E5EC] flex flex-col gap-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#123B5D] flex items-center gap-1.5 font-label-caps">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {t.agent}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#587083] font-telemetry">{t.domain}</span>
                    <span className="px-1.5 py-0.2 rounded bg-white text-[#147FB3] text-[9px] font-mono border border-[#CFE6F3] font-bold">
                      {t.latency}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-[#587083] pl-5 leading-relaxed">{t.summary}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-[#E8F4FA] border border-[#CFE6F3] text-[11px] text-[#123B5D] flex items-center justify-between font-telemetry">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#147FB3]" />
              Multi-Agent Orchestrator Total Handoff Latency:
            </span>
            <span className="font-bold text-[#147FB3]">420ms</span>
          </div>
        </div>
      )}
    </div>
  );
};
