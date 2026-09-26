import React, { useEffect, useState } from 'react';
import {
  Database,
  Waves,
  Wind,
  Thermometer,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Radio,
  Compass,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Eye,
  CloudRain,
} from 'lucide-react';
import { useRegion } from '@/hooks/useRegion';
import { observationService, type ObservationServiceResult } from '@/services/observationService';
import type { NormalizedObservationContract } from '@/types/contract';

export const PersistedObservationPanel: React.FC = () => {
  const { activeRegion } = useRegion();
  const [data, setData] = useState<ObservationServiceResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingIncois, setSyncingIncois] = useState<boolean>(false);
  const [syncingImd, setSyncingImd] = useState<boolean>(false);
  const [syncingDemo, setSyncingDemo] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const regionId = activeRegion.id === 'tamil_nadu' ? 'tamil_nadu' : 'maharashtra';

    observationService.fetchObservations({ region: regionId, limit: 12 }).then((result) => {
      if (isMounted) {
        setData(result);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeRegion.id]);

  const handleSyncIncois = async () => {
    setSyncingIncois(true);
    setStatusMessage('Querying official INCOIS OSF endpoints...');
    const regionId = activeRegion.id === 'tamil_nadu' ? 'tamil_nadu' : 'maharashtra';
    const lat = activeRegion.id === 'tamil_nadu' ? 10.76 : 18.92;
    const lon = activeRegion.id === 'tamil_nadu' ? 79.84 : 72.83;

    const res = await observationService.triggerIncoisIngestion({
      region: regionId,
      latitude: lat,
      longitude: lon,
      allowFallback: true,
    });

    if (res.success && res.isLive) {
      setStatusMessage('✓ Successfully ingested live INCOIS OSF oceanography into Supabase.');
    } else if (res.fallbackUsed) {
      setStatusMessage('ⓘ INCOIS server unreachable. Retained verified demo baseline.');
    } else {
      setStatusMessage(`⚠ Ingestion notice: ${res.error || 'Check server connection'}`);
    }

    const refreshed = await observationService.fetchObservations({ region: regionId, limit: 12 });
    setData(refreshed);
    setSyncingIncois(false);
  };

  const handleSyncImd = async () => {
    setSyncingImd(true);
    setStatusMessage('Querying official IMD Weather & Marine Warning feeds...');
    const regionId = activeRegion.id === 'tamil_nadu' ? 'tamil_nadu' : 'maharashtra';
    const lat = activeRegion.id === 'tamil_nadu' ? 10.76 : 18.92;
    const lon = activeRegion.id === 'tamil_nadu' ? 79.84 : 72.83;

    const res = await observationService.triggerImdIngestion({
      region: regionId,
      latitude: lat,
      longitude: lon,
      allowFallback: true,
    });

    if (res.success && res.isLive) {
      setStatusMessage('✓ Ingested official IMD Weather & Coastal Warning bulletins.');
    } else if (res.fallbackUsed) {
      setStatusMessage('ⓘ IMD service unreachable. Retained verified baseline snapshot.');
    } else {
      setStatusMessage(`⚠ IMD ingestion notice: ${res.error || 'Check connection'}`);
    }

    const refreshed = await observationService.fetchObservations({ region: regionId, limit: 12 });
    setData(refreshed);
    setSyncingImd(false);
  };

  const handleSyncDemo = async () => {
    setSyncingDemo(true);
    setStatusMessage('Refreshing deterministic baseline snapshot...');
    const regionId = activeRegion.id === 'tamil_nadu' ? 'tamil_nadu' : 'maharashtra';
    await observationService.triggerDemoIngestion([regionId]);
    const refreshed = await observationService.fetchObservations({ region: regionId, limit: 12 });
    setData(refreshed);
    setStatusMessage('✓ Deterministic baseline snapshot synchronized with Supabase.');
    setSyncingDemo(false);
  };

  const getVariableIcon = (varName: string) => {
    if (varName.includes('wave') || varName.includes('swell')) {
      return <Waves className="w-3.5 h-3.5 text-cyan-400" />;
    }
    if (varName.includes('wind') || varName.includes('gust')) {
      return <Wind className="w-3.5 h-3.5 text-sky-400" />;
    }
    if (varName.includes('temp') || varName.includes('sst')) {
      return <Thermometer className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (varName.includes('current')) {
      return <Compass className="w-3.5 h-3.5 text-teal-400" />;
    }
    if (varName.includes('visibility')) {
      return <Eye className="w-3.5 h-3.5 text-indigo-400" />;
    }
    if (varName.includes('rain')) {
      return <CloudRain className="w-3.5 h-3.5 text-blue-400" />;
    }
    if (varName.includes('warning') || varName.includes('alert')) {
      return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
    }
    return <Activity className="w-3.5 h-3.5 text-emerald-400" />;
  };

  const formatVarTitle = (name: string): string => {
    return name
      .replace(/imd_/g, '')
      .replace(/_/g, ' ')
      .toUpperCase();
  };

  const observations = data?.observations || [];
  const isLiveIncois = observations.some((o) => o.status === 'LIVE' && o.dataset_identifier.includes('ocean_state'));
  const isLiveImd = observations.some((o) => o.status === 'LIVE' && o.dataset_identifier.includes('weather'));
  const isAnyLive = isLiveIncois || isLiveImd;

  // Extract active warning if present
  const warningObs = observations.find((o) => o.variable_name === 'imd_marine_warning' || o.category === 'HAZARD');
  const warningStruct = warningObs?.structured_value as {
    warningLevel?: string;
    warningCategory?: string;
    advisoryText?: string;
    isWarningActive?: boolean;
    validUntil?: string;
    isFishermenAdvisedToAvoidSea?: boolean;
  } | undefined;

  return (
    <div className="hud-glass rounded-xl p-4 flex flex-col gap-3 border border-slate-800/80 shadow-lg select-none">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="text-[10px] font-label-caps text-slate-200 font-bold tracking-wider block">
              ENVIRONMENTAL OBSERVATIONS
            </span>
            <span className="text-[8px] font-telemetry text-slate-400 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 text-cyan-400" />
              {activeRegion.name}
            </span>
          </div>
        </div>

        {/* Live / Baseline Badge */}
        <div className="flex items-center gap-1.5">
          {isAnyLive ? (
            <span className="text-[9px] font-telemetry text-emerald-300 bg-emerald-950/80 border border-emerald-600/80 px-2 py-0.5 rounded font-bold flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              LIVE TELEMETRY
            </span>
          ) : (
            <span className="text-[9px] font-telemetry text-amber-400 bg-amber-950/70 border border-amber-800/70 px-2 py-0.5 rounded font-semibold">
              DEMO SNAPSHOT
            </span>
          )}
        </div>
      </div>

      {/* Backend Provenance Bar */}
      <div className="flex items-center justify-between text-[10px] font-telemetry px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
        <div className="flex items-center gap-1.5">
          {data?.isPersistedBackend ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-300 font-medium">Supabase / PostGIS Persisted</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-amber-300">Memory / Cache Mode</span>
            </>
          )}
        </div>
        <div className="text-slate-400 text-right text-[9px] truncate max-w-[140px]">
          {isAnyLive ? (
            <span className="text-emerald-300 font-bold">INCOIS + IMD</span>
          ) : (
            <span className="text-slate-200">ORCA_DEMO</span>
          )}
        </div>
      </div>

      {/* Ingestion Actions Bar (3-column responsive) */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={handleSyncIncois}
          disabled={syncingIncois || syncingImd || syncingDemo}
          className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-700/60 text-cyan-300 font-bold text-[9px] font-label-caps transition-all disabled:opacity-50"
          title="Query official INCOIS ERDDAP oceanography feed"
        >
          <RefreshCw className={`w-2.5 h-2.5 ${syncingIncois ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{syncingIncois ? 'INCOIS...' : 'INCOIS OSF'}</span>
        </button>

        <button
          onClick={handleSyncImd}
          disabled={syncingIncois || syncingImd || syncingDemo}
          className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/80 border border-sky-700/60 text-sky-300 font-bold text-[9px] font-label-caps transition-all disabled:opacity-50"
          title="Query official IMD weather & marine warning bulletin"
        >
          <RefreshCw className={`w-2.5 h-2.5 ${syncingImd ? 'animate-spin text-sky-400' : ''}`} />
          <span>{syncingImd ? 'IMD...' : 'IMD WEATHER'}</span>
        </button>

        <button
          onClick={handleSyncDemo}
          disabled={syncingIncois || syncingImd || syncingDemo}
          className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 text-slate-300 font-bold text-[9px] font-label-caps transition-all disabled:opacity-50"
          title="Reset to deterministic baseline snapshot"
        >
          <RefreshCw className={`w-2.5 h-2.5 ${syncingDemo ? 'animate-spin text-slate-400' : ''}`} />
          <span>{syncingDemo ? 'DEMO...' : 'DEMO'}</span>
        </button>
      </div>

      {/* Status Notice if present */}
      {statusMessage && (
        <div className="text-[9px] font-telemetry px-2 py-1 rounded bg-slate-900/90 border border-cyan-900/50 text-slate-300 leading-tight">
          {statusMessage}
        </div>
      )}

      {/* Active Marine Warning Banner (if IMD alert present) */}
      {warningStruct && (
        <div className={`p-2.5 rounded-lg border text-xs font-telemetry flex flex-col gap-1 ${
          warningStruct.warningLevel === 'RED' || warningStruct.warningLevel === 'WARNING'
            ? 'bg-rose-950/60 border-rose-600/80 text-rose-200'
            : warningStruct.warningLevel === 'ORANGE' || warningStruct.warningLevel === 'ALERT'
            ? 'bg-amber-950/60 border-amber-600/80 text-amber-200'
            : warningStruct.warningLevel === 'YELLOW' || warningStruct.warningLevel === 'WATCH'
            ? 'bg-yellow-950/50 border-yellow-600/60 text-yellow-200'
            : 'bg-emerald-950/40 border-emerald-700/40 text-emerald-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold font-label-caps flex items-center gap-1 text-[10px]">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              IMD BULLETIN: {warningStruct.warningLevel || 'GREEN'}
            </span>
            <span className="text-[9px] font-semibold opacity-80">
              {warningStruct.validUntil ? `Until ${new Date(warningStruct.validUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST` : 'ACTIVE'}
            </span>
          </div>
          <p className="text-[10px] leading-tight opacity-90">
            {warningStruct.advisoryText || 'No severe weather warning issued. Sea condition moderate.'}
          </p>
          {warningStruct.isFishermenAdvisedToAvoidSea && (
            <span className="text-[9px] font-bold text-rose-300 mt-0.5">
              ⚠ FISHERMEN ADVISED NOT TO VENTURE INTO OPEN SEA
            </span>
          )}
        </div>
      )}

      {/* Observations Grid / Skeletons */}
      {loading ? (
        <div className="grid grid-cols-2 gap-2 py-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 animate-pulse flex flex-col gap-1.5"
            >
              <div className="h-2 bg-slate-800 rounded w-16" />
              <div className="h-4 bg-slate-700 rounded w-20" />
              <div className="h-2 bg-slate-800 rounded w-24" />
            </div>
          ))}
        </div>
      ) : observations.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
          {observations
            .filter((obs) => obs.variable_name !== 'imd_marine_warning')
            .map((obs: NormalizedObservationContract) => (
              <div
                key={obs.id}
                className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/90 flex flex-col gap-1 hover:border-cyan-500/50 transition-all group relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    {getVariableIcon(obs.variable_name)}
                    <span className="text-[9px] font-label-caps text-slate-300 truncate max-w-[80px] font-semibold">
                      {formatVarTitle(obs.variable_name)}
                    </span>
                  </div>
                  <span
                    className={`text-[8px] font-telemetry px-1 py-0.2 rounded font-bold ${
                      obs.status === 'LIVE'
                        ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/40'
                        : 'text-cyan-400 bg-cyan-950/40'
                    }`}
                  >
                    {obs.status === 'LIVE' ? 'LIVE' : obs.quality_level}
                  </span>
                </div>

                <div className="text-sm font-bold text-slate-100 font-telemetry tracking-tight">
                  {obs.numeric_value !== null && obs.numeric_value !== undefined
                    ? `${obs.numeric_value} ${obs.unit || ''}`
                    : 'RECORDED'}
                </div>

                <div className="flex items-center justify-between text-[8px] font-telemetry text-slate-500">
                  <span className="truncate">
                    {new Date(obs.observed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                  </span>
                  <span className="text-slate-400 truncate max-w-[70px]">
                    {((obs.raw_metadata as Record<string, unknown>)?.agency as string) ||
                      (obs.category === 'OCEAN' ? 'INCOIS' : 'IMD')}
                  </span>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/80 text-center flex flex-col items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <p className="text-xs text-slate-300 font-medium">No persisted observation records found.</p>
          <div className="flex gap-2">
            <button
              onClick={handleSyncIncois}
              disabled={syncingIncois}
              className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-label-caps rounded transition-colors"
            >
              INGEST INCOIS
            </button>
            <button
              onClick={handleSyncImd}
              disabled={syncingImd}
              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs font-label-caps rounded transition-colors"
            >
              INGEST IMD
            </button>
            <button
              onClick={handleSyncDemo}
              disabled={syncingDemo}
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs font-label-caps rounded transition-colors"
            >
              DEMO
            </button>
          </div>
        </div>
      )}

      {/* Provenance Footnote */}
      <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-telemetry text-slate-500">
        <span>INCOIS OSF · IMD Coastal Weather</span>
        <div className="flex gap-2">
          <a
            href="https://incois.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline flex items-center gap-0.5"
          >
            INCOIS <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <span>•</span>
          <a
            href="https://mausam.imd.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:underline flex items-center gap-0.5"
          >
            IMD <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
