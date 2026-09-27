import React from 'react';
import { DecisionHeroCard } from '@/components/decision/DecisionHeroCard';
import { TripSafetyHUD } from '@/components/safety/TripSafetyHUD';
import { PfzOpportunityPanel } from '@/components/fisheries/PfzOpportunityPanel';
import { PersistedObservationPanel } from '@/components/decision/PersistedObservationPanel';
import { AnalysisTraceAccordion } from '@/components/decision/AnalysisTraceAccordion';
import { useRegion } from '@/hooks/useRegion';
import { 
  Waves, 
  Thermometer, 
  Navigation, 
  MapPin, 
  Calendar,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes';

export const FishermanHomePage: React.FC = () => {
  const { activeRegion } = useRegion();
  const { weatherData, oceanData, vesselsData, pfzData } = activeRegion;
  const vessel = vesselsData.profiles[0];
  const topPfz = pfzData.zones[0];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* Top Welcome & Region Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-telemetry text-cyan-400 mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{activeRegion.name.toUpperCase()} • {activeRegion.seaBody}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display-decision">
            Good morning, Captain
          </h1>
          <p className="text-xs text-slate-400">
            Active vessel: <strong className="text-slate-200">{vessel.name}</strong> • Home Port: {vessel.homePort.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.MISSION}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-label-caps tracking-wider transition flex items-center gap-1.5 shadow-md"
          >
            <Compass className="w-4 h-4" />
            <span>PLAN NEW TRIP</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </div>

      {/* Primary Operational Decision Hero Card */}
      <DecisionHeroCard
        verdict="CAUTION"
        confidence={78.4}
        departureTime="05:45 IST"
        durationHours={5}
        vesselName={vessel.name}
      />

      {/* Primary Instrument Cluster: Trip Safety & Opportunity Separation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Trip Safety HUD + Live Marine Conditions */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <TripSafetyHUD
            vessel={vessel}
            nearestPfz={topPfz}
            departureTime="05:45 IST"
            durationHours={5}
          />

          {/* Quick Marine Conditions Summary Grid */}
          <div className="hud-glass rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase font-label-caps tracking-wider">
                  Marine Environmental Snapshot
                </h3>
              </div>
              <span className="text-[10px] font-telemetry text-slate-400">
                INCOIS OSF • 26 Sep
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Wave Swell */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-telemetry">Wave Swell</div>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {weatherData.currentConditions.waveHeightMeters}m
                </div>
                <div className="text-[9px] text-emerald-400 font-medium">Safe (&le; 1.4m)</div>
              </div>

              {/* Surface Wind */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-telemetry">Wind Velocity</div>
                <div className="text-base font-bold text-cyan-300 font-mono mt-0.5">
                  {weatherData.currentConditions.windSpeedKnots} kts
                </div>
                <div className="text-[9px] text-slate-400">Direction: {weatherData.currentConditions.windDirection}</div>
              </div>

              {/* Sea Surface Temp */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-telemetry flex items-center justify-center gap-1">
                  <Thermometer className="w-3 h-3 text-rose-400" />
                  SST
                </div>
                <div className="text-base font-bold text-rose-300 font-mono mt-0.5">
                  {oceanData.parameters.seaSurfaceTemperatureCelsius}°C
                </div>
                <div className="text-[9px] text-emerald-400">Front Gradient OK</div>
              </div>

              {/* Surface Drift */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-telemetry flex items-center justify-center gap-1">
                  <Navigation className="w-3 h-3 text-cyan-400" />
                  Current
                </div>
                <div className="text-base font-bold text-teal-300 font-mono mt-0.5">
                  {oceanData.parameters.surfaceCurrentKnots} kts
                </div>
                <div className="text-[9px] text-slate-400">Direction: {oceanData.parameters.currentDirection}</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Forecast window valid through 18:00 IST
              </span>
              <Link
                to={ROUTES.MAP}
                className="text-cyan-400 hover:text-white underline underline-offset-4 text-[10px] font-label-caps"
              >
                VIEW CARTOGRAPHY &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live PFZ Opportunity + Persisted Observations */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <PfzOpportunityPanel />
          <PersistedObservationPanel />
        </div>
      </div>

      {/* Technical Reasoning & Multi-Agent Analysis Trace (Accordion for Inspection) */}
      <AnalysisTraceAccordion />
    </div>
  );
};
