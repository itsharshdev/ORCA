import React from 'react';
import { Check, Cpu, Waves, CloudSun, Fish, ShieldCheck } from 'lucide-react';

interface AgentStep {
  name: string;
  role: string;
  status: 'complete' | 'active' | 'queued';
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ReasoningChain: React.FC = () => {
  const steps: AgentStep[] = [
    {
      name: 'Mission Planner',
      role: 'Intent & Constraint Extraction',
      status: 'complete',
      detail: '5 hr fishing mission • Departure 05:45 • Vessel: Traditional Motorized',
      icon: Cpu,
    },
    {
      name: 'Oceanography Agent',
      role: 'Hydrographic & Thermal Correlation',
      status: 'complete',
      detail: 'SST 27.8°C • Chlorophyll 1.84 mg/m³ • Current 0.8 kts SSE',
      icon: Waves,
    },
    {
      name: 'Meteorology Agent',
      role: 'Weather & Wave State Evaluation',
      status: 'complete',
      detail: 'Wind 12.5 kts (Fair) • Wave Swell 1.4m • Rising to 2.1m post-12:00',
      icon: CloudSun,
    },
    {
      name: 'PFZ Analysis Agent',
      role: 'Potential Fishing Zone Scoring',
      status: 'complete',
      detail: 'PFZ-MUM-01 High Potential (18.5 km, 245° bearing)',
      icon: Fish,
    },
    {
      name: 'Geo / Safety Agent',
      role: 'Geofence & Hazard Corridor Verification',
      status: 'active',
      detail: 'Restricted naval boundary clear by 4.2 km • Shoal bank clearance OK',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="hud-glass rounded-xl p-4 flex flex-col gap-3 border border-slate-800/80 shadow-lg">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <h2 className="text-[11px] font-label-caps text-slate-400 tracking-wider">
          AGENT REASONING TRACE
        </h2>
        <span className="text-[10px] font-telemetry text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          5 AGENTS SYNCED
        </span>
      </div>

      <div className="flex flex-col gap-2.5 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isComplete = step.status === 'complete';
          const isActive = step.status === 'active';

          return (
            <div key={idx} className="flex items-start gap-3 relative group">
              {/* Connector Line */}
              {idx < steps.length - 1 && (
                <div className="absolute left-3.5 top-7 bottom-0 w-px bg-slate-800" />
              )}

              {/* Node Indicator */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                  isComplete
                    ? 'bg-emerald-500/15 border border-emerald-500 text-emerald-400'
                    : isActive
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-400 shadow-[0_0_8px_rgba(70,234,237,0.5)]'
                    : 'bg-slate-800 border border-slate-700 text-slate-500'
                }`}
              >
                {isComplete ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">{step.name}</span>
                  <span className="text-[10px] font-telemetry text-slate-500">{step.role}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-telemetry mt-0.5 truncate">
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
