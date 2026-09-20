import React, { useEffect, useState } from 'react';
import { Database, Waves, Wind, Thermometer, Activity, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRegion } from '@/hooks/useRegion';
import { observationService, type ObservationServiceResult } from '@/services/observationService';
import type { NormalizedObservationContract } from '@/types/contract';

export const PersistedObservationPanel: React.FC = () => {
  const { activeRegion } = useRegion();
  const [data, setData] = useState<ObservationServiceResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [ingesting, setIngesting] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const regionId = activeRegion.id === 'tamil_nadu' ? 'tamil_nadu' : 'maharashtra';
    
    observationService.fetchObservations({ region: regionId, limit: 8 }).then((result) => {
      if (isMounted) {
        setData(result);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeRegion.id]);

  const handleIngest = async () => {
    setIngesting(true);
    const regionId = activeRegion.id === 'tamil_nadu' ? 'tamil_nadu' : 'maharashtra';
    await observationService.triggerDemoIngestion([regionId]);
    const refreshed = await observationService.fetchObservations({ region: regionId, limit: 8 });
    setData(refreshed);
    setIngesting(false);
  };

  const getVariableIcon = (varName: string) => {
    if (varName.includes('wave')) return <Waves className="w-4 h-4 text-cyan-400" />;
    if (varName.includes('wind')) return <Wind className="w-4 h-4 text-sky-400" />;
    if (varName.includes('temp')) return <Thermometer className="w-4 h-4 text-amber-400" />;
    return <Activity className="w-4 h-4 text-emerald-400" />;
  };

  const formatVarTitle = (name: string): string => {
    return name.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="hud-glass rounded-xl p-4 flex flex-col gap-3 border border-slate-800/80 shadow-lg select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-label-caps text-slate-300 font-bold tracking-wider">
            PERSISTED OBSERVATIONS (SUPABASE)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-telemetry text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded font-semibold">
            DEMO SNAPSHOT
          </span>
          <button
            onClick={handleIngest}
            disabled={ingesting || loading}
            title="Trigger Ingestion & Sync with Supabase"
            className="p-1 text-slate-400 hover:text-cyan-400 rounded transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${ingesting ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Backend Status Bar */}
      <div className="flex items-center justify-between text-[10px] font-telemetry px-2 py-1 rounded bg-slate-900/60 border border-slate-800/60">
        <div className="flex items-center gap-1.5">
          {data?.isPersistedBackend ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-300">Live API &amp; DB Connected</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span className="text-amber-300">Offline / Standalone Mode</span>
            </>
          )}
        </div>
        <span className="text-slate-400">
          Source: <strong className="text-slate-200">ORCA_DEMO</strong>
        </span>
      </div>

      {/* Observations Grid */}
      {loading ? (
        <div className="py-6 flex items-center justify-center text-xs text-slate-400 font-telemetry">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400 mr-2" />
          Loading persisted observations...
        </div>
      ) : data?.observations && data.observations.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
          {data.observations.map((obs: NormalizedObservationContract) => (
            <div
              key={obs.id}
              className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80 flex flex-col gap-1 hover:border-cyan-500/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  {getVariableIcon(obs.variable_name)}
                  <span className="text-[9px] font-label-caps text-slate-400 truncate max-w-[90px]">
                    {formatVarTitle(obs.variable_name)}
                  </span>
                </div>
                <span className="text-[8px] font-telemetry text-cyan-400 px-1 py-0.2 bg-cyan-950/40 rounded">
                  {obs.quality_level}
                </span>
              </div>

              <div className="text-sm font-semibold text-slate-100 font-telemetry">
                {obs.numeric_value !== null && obs.numeric_value !== undefined
                  ? `${obs.numeric_value} ${obs.unit || ''}`
                  : obs.category === 'WEATHER' && obs.structured_value?.active
                  ? 'ACTIVE ALERT'
                  : 'RECORDED'}
              </div>

              <div className="text-[8px] font-telemetry text-slate-500 truncate">
                Observed: {new Date(obs.observed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 rounded bg-slate-900/40 border border-slate-800/60 text-center">
          <p className="text-xs text-slate-400 mb-2">No observations persisted in database yet.</p>
          <button
            onClick={handleIngest}
            disabled={ingesting}
            className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-label-caps rounded transition-colors"
          >
            {ingesting ? 'INGESTING...' : 'RUN DEMO INGESTION NOW'}
          </button>
        </div>
      )}
    </div>
  );
};
