import React from 'react';
import { useOrchestration } from '@/hooks/useOrchestration';
import { AgentInspectionModal } from './AgentInspectionModal';
import type { AgentId } from '@/types/agents';
import { 
  Check, 
  Loader2, 
  Circle, 
  Cpu, 
  Waves, 
  CloudSun, 
  Fish, 
  ShieldCheck, 
  ChevronRight 
} from 'lucide-react';

interface AgentStepItem {
  id: AgentId;
  name: string;
  role: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ReasoningChain: React.FC = () => {
  const { 
    orchestration, 
    agentStatuses, 
    isOrchestrating, 
    selectedAgent, 
    selectAgentForInspection, 
    closeAgentInspection 
  } = useOrchestration();

  const agentSteps: AgentStepItem[] = [
    {
      id: 'planner',
      name: 'Mission Planner',
      role: 'Intent & Constraint Extraction',
      icon: Cpu,
    },
    {
      id: 'ocean',
      name: 'Oceanography Agent',
      role: 'Hydrographic & Thermal Correlation',
      icon: Waves,
    },
    {
      id: 'weather',
      name: 'Meteorology Agent',
      role: 'Weather & Wave State Evaluation',
      icon: CloudSun,
    },
    {
      id: 'pfz',
      name: 'PFZ Analysis Agent',
      role: 'Potential Fishing Zone Scoring',
      icon: Fish,
    },
    {
      id: 'geoSafety',
      name: 'Geo / Safety Agent',
      role: 'Geofence & Hazard Corridor Verification',
      icon: ShieldCheck,
    },
  ];

  const getAgentSummary = (id: AgentId): string => {
    if (!orchestration) return 'Awaiting orchestration execution...';
    switch (id) {
      case 'planner':
        return orchestration.planner.summary;
      case 'ocean':
        return orchestration.ocean.summary;
      case 'weather':
        return orchestration.weather.summary;
      case 'pfz':
        return orchestration.pfz.summary;
      case 'geoSafety':
        return orchestration.geoSafety.summary;
      default:
        return '';
    }
  };

  return (
    <>
      <div className="hud-glass rounded-xl p-4 flex flex-col gap-3 border border-slate-800/80 shadow-lg select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div>
            <h2 className="text-[11px] font-label-caps text-slate-400 tracking-wider">
              AGENT REASONING PIPELINE
            </h2>
            <span className="text-[10px] text-slate-500 font-telemetry">CLICK TO INSPECT FINDINGS</span>
          </div>

          <span className={`text-[10px] font-telemetry px-2 py-0.5 rounded flex items-center gap-1 ${
            isOrchestrating
              ? 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
              : 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/50'
          }`}>
            {isOrchestrating ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                <span>COORDINATING AGENTS</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>5 AGENTS SYNCED</span>
              </>
            )}
          </span>
        </div>

        {/* Pipeline Step Nodes */}
        <div className="flex flex-col gap-2 relative">
          {agentSteps.map((step, idx) => {
            const Icon = step.icon;
            const status = agentStatuses[step.id] || 'queued';
            const isCompleted = status === 'completed';
            const isRunning = status === 'running';
            const summary = getAgentSummary(step.id);

            return (
              <div
                key={step.id}
                onClick={() => isCompleted && selectAgentForInspection(step.id)}
                className={`flex items-start gap-3 relative p-2 rounded-xl transition-all ${
                  isCompleted
                    ? 'hover:bg-slate-900/60 cursor-pointer group'
                    : isRunning
                    ? 'bg-cyan-950/20 border border-cyan-500/30'
                    : 'opacity-60'
                }`}
              >
                {/* Vertical Connector Line */}
                {idx < agentSteps.length - 1 && (
                  <div className="absolute left-5 top-8 bottom-0 w-px bg-slate-800 pointer-events-none" />
                )}

                {/* Node Status Indicator */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                    isCompleted
                      ? 'bg-emerald-500/15 border border-emerald-500 text-emerald-400 group-hover:bg-emerald-500/25'
                      : isRunning
                      ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(70,234,237,0.5)]'
                      : 'bg-slate-800 border border-slate-700 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : isRunning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Circle className="w-2.5 h-2.5" />
                  )}
                </div>

                {/* Content Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Icon className="w-3 h-3 text-cyan-400" />
                      <span>{step.name}</span>
                    </span>
                    <span className="text-[10px] font-telemetry text-slate-500">
                      {status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-telemetry mt-0.5 line-clamp-2">
                    {isRunning ? 'Executing analysis on marine dataset...' : summary || step.role}
                  </p>
                </div>

                {/* Right Arrow on Completed */}
                {isCompleted && (
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 shrink-0 self-center transition-colors" />
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Handoff Pill */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-telemetry text-slate-400">
          <span>ANALYSIS PACKAGE:</span>
          <span className="text-cyan-400 font-bold">READY FOR DECISION HANDOFF</span>
        </div>
      </div>

      {/* Inspection Modal */}
      {selectedAgent && (
        <AgentInspectionModal agent={selectedAgent} onClose={closeAgentInspection} />
      )}
    </>
  );
};
