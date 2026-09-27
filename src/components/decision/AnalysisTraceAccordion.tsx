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
    <div className={`hud-glass rounded-2xl border border-slate-800 overflow-hidden transition select-none ${className}`}>
      {/* Accordion Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between bg-slate-900/40 hover:bg-slate-900/70 transition text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide uppercase font-label-caps">
                Technical Reasoning &amp; Analysis Trace
              </span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 text-[10px] font-mono font-bold border border-cyan-800">
                AUDIT LOG
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Multi-agent reasoning pipeline &amp; deterministic handoff telemetry (Inspect for technical review)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-[11px] font-mono hidden sm:inline">
            {isOpen ? 'Collapse Trace' : 'Expand Trace'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 flex flex-col gap-3 animate-fade-in text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5 font-telemetry">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              ORCA Reasoning Pipeline • Audit Trace Verified
            </span>
            <span>Total Latency: 1.18s</span>
          </div>

          <div className="flex flex-col gap-2">
            {traces.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 font-bold text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{step.agent}</span>
                    <span className="text-[10px] text-slate-500 font-normal">• {step.domain}</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">
                    {step.latency}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pl-5.5 leading-relaxed">
                  {step.summary}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-2 p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-[10px] text-cyan-300 flex items-center gap-2">
            <Layers className="w-4 h-4 shrink-0" />
            <span>
              All agent observation records are normalized, timestamped, and stored with immutable PostGIS geometry in Supabase.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
