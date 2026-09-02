import React from 'react';
import { MarineMapCanvas } from '@/components/map/MarineMapCanvas';
import { MissionCard } from '@/components/decision/MissionCard';
import { DecisionCard } from '@/components/decision/DecisionCard';
import { ReasoningChain } from '@/components/agents/ReasoningChain';
import { OrcaAssistant } from '@/components/agents/OrcaAssistant';
import { AlertTriangle, MapPin, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes';

export const CommandCenterPage: React.FC = () => {
  return (
    <div className="relative w-full h-full flex-1 flex flex-col md:flex-row overflow-hidden">
      {/* Absolute Full Marine Map Canvas (HUD Background Anchor) */}
      <div className="absolute inset-0 w-full h-full z-0">
        <MarineMapCanvas className="w-full h-full" showOverlayControls={false} />
      </div>

      {/* Desktop HUD Left Panel (Instrument Cluster: Mission + Decision) */}
      <aside className="hidden lg:flex relative z-20 w-80 xl:w-96 m-4 flex-col gap-4 overflow-y-auto max-h-[calc(100vh-6rem)] pointer-events-auto shrink-0">
        <MissionCard />
        <DecisionCard />

        {/* Safety Alert Banner */}
        <div className="hud-glass rounded-xl p-3.5 border border-rose-500/30 flex flex-col gap-2 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500" />
          <div className="flex items-center gap-2 pl-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="text-[11px] font-label-caps text-rose-400 font-bold">
              SAFETY WATCH CORRIDOR
            </span>
          </div>
          <p className="text-xs text-slate-300 pl-2 leading-relaxed">
            Return corridor intersects elevated wave risk beyond 12:00 IST. Maintain 4.2 km clearance from Naval Anchorage Geofence.
          </p>
          <div className="pl-2 mt-0.5">
            <Link
              to={ROUTES.MAP}
              className="text-[10px] font-label-caps text-cyan-400 hover:text-white underline underline-offset-4"
            >
              INSPECT ON FULL MAP &rarr;
            </Link>
          </div>
        </div>
      </aside>

      {/* Middle Spacer so Map remains visually dominant */}
      <div className="flex-1 pointer-events-none hidden lg:block" />

      {/* Desktop HUD Right Panel (Reasoning Chain & Assistant) */}
      <aside className="hidden lg:flex relative z-20 w-96 xl:w-[420px] m-4 flex-col gap-4 overflow-y-auto max-h-[calc(100vh-6rem)] pointer-events-auto shrink-0">
        <ReasoningChain />
        <OrcaAssistant />
      </aside>

      {/* Mobile Stacked Layout */}
      <div className="lg:hidden relative z-20 flex-1 flex flex-col p-3 gap-3 overflow-y-auto">
        <div className="p-2 rounded-xl hud-glass text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">COMMAND CENTER</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-telemetry text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>ARABIAN SEA</span>
          </div>
        </div>

        {/* Decision Hero */}
        <DecisionCard />

        {/* Mission Summary */}
        <MissionCard />

        {/* Map Preview Container */}
        <div className="h-64 rounded-xl overflow-hidden border border-slate-800 relative shrink-0">
          <MarineMapCanvas className="w-full h-full" showOverlayControls={false} />
          <Link
            to={ROUTES.MAP}
            className="absolute bottom-3 right-3 z-30 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs font-label-caps shadow-lg"
          >
            EXPAND FULL MAP
          </Link>
        </div>

        {/* Assistant Section */}
        <OrcaAssistant />

        {/* Agent Trace */}
        <ReasoningChain />
      </div>
    </div>
  );
};
