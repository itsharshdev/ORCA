import React from 'react';
import type { BaseAgentResult } from '@/types/agents';
import { 
  Cpu, 
  Waves, 
  CloudSun, 
  Fish, 
  ShieldCheck, 
  X, 
  Database, 
  CheckCircle2, 
  Layers
} from 'lucide-react';
import { DataFreshnessBadge } from '@/components/ui/DataFreshnessBadge';

const AgentTypeIcon: React.FC<{ agentId: string; className?: string }> = ({ agentId, className }) => {
  switch (agentId) {
    case 'planner':
      return <Cpu className={className} />;
    case 'ocean':
      return <Waves className={className} />;
    case 'weather':
      return <CloudSun className={className} />;
    case 'pfz':
      return <Fish className={className} />;
    case 'geoSafety':
      return <ShieldCheck className={className} />;
    default:
      return <Layers className={className} />;
  }
};

interface AgentInspectionModalProps {
  agent: BaseAgentResult | null;
  onClose: () => void;
}

export const AgentInspectionModal: React.FC<AgentInspectionModalProps> = ({ agent, onClose }) => {
  if (!agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="hud-glass rounded-2xl w-full max-w-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900/90 border-b border-slate-800 p-4 sm:p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <AgentTypeIcon agentId={agent.agentId} className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-label-caps text-cyan-400">
                  SPECIALIZED AGENT INSPECTOR
                </span>
                <span className="text-[10px] font-telemetry text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.2 rounded">
                  {agent.status.toUpperCase()}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {agent.agentName}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4 text-xs">
          {/* Agent Role & Summary */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1.5">
            <span className="text-[10px] font-label-caps text-slate-400">CORE RESPONSIBILITY</span>
            <p className="text-slate-200 font-medium leading-relaxed font-sans">{agent.role}</p>
            <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-800/60 font-telemetry">
              Summary: {agent.summary}
            </div>
          </div>

          {/* Key Metrics / Observations Data */}
          <div>
            <span className="text-[10px] font-label-caps text-slate-400 block mb-2">
              NORMALIZED OBSERVATIONAL METRICS
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-telemetry">
              {Object.entries(agent.data).map(([key, val]) => {
                if (typeof val === 'object' && val !== null) return null;
                return (
                  <div key={key} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase font-label-caps truncate">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="text-slate-200 font-semibold truncate block mt-0.5">
                      {String(val)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Structured Evidence Items & Provenance */}
          {agent.evidence && agent.evidence.length > 0 && (
            <div>
              <span className="text-[10px] font-label-caps text-slate-400 block mb-2">
                STRUCTURED EVIDENCE &amp; PROVENANCE AUDIT
              </span>
              <div className="flex flex-col gap-2">
                {agent.evidence.map((ev, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{ev.label}</span>
                      <span className={`text-[10px] font-label-caps px-2 py-0.2 rounded border ${
                        ev.impact === 'positive'
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                          : ev.impact === 'cautionary'
                          ? 'bg-amber-950/40 text-amber-400 border-amber-800/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}>
                        {ev.impact.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[11px] font-telemetry text-slate-300">
                      Value: {ev.value}
                    </div>
                    <div className="text-[10px] font-telemetry text-slate-500 flex items-center gap-2 pt-1 border-t border-slate-800/50">
                      <span className="flex items-center gap-1">
                        <Database className="w-3 h-3 text-cyan-400" />
                        <span>Source: {ev.provenance.source}</span>
                      </span>
                      <span>•</span>
                      <span>Observed: {ev.provenance.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Handshake to Orchestration */}
          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/30 flex items-center justify-between font-telemetry">
            <div className="flex items-center gap-2 text-cyan-300 text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Output successfully handed off to Orchestration Package</span>
            </div>
            <span className="text-[10px] font-bold text-cyan-400 font-label-caps">
              {agent.confidence}% CONFIDENCE
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900/90 border-t border-slate-800 p-3 sm:p-4 flex items-center justify-between">
          <DataFreshnessBadge status={agent.sourceStatus} />
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-label-caps font-semibold transition-colors"
          >
            CLOSE INSPECTION
          </button>
        </div>
      </div>
    </div>
  );
};
